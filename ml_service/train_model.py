import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error

def generate_gurgaon_dataset(num_samples=10000):
    np.random.seed(42)

    localities = [
        "Golf Course Road", "DLF Phase 5", "Golf Course Extension", "Sector 54",
        "MG Road", "Sector 65", "Sector 43", "Sohna Road", "Dwarka Expressway",
        "Sector 81", "Sector 84", "Sector 102", "Sector 109"
    ]

    locality_rates = {
        "Golf Course Road": 26500,
        "DLF Phase 5": 22000,
        "Golf Course Extension": 17500,
        "Sector 54": 18500,
        "MG Road": 15500,
        "Sector 65": 14800,
        "Sector 43": 13900,
        "Sohna Road": 10200,
        "Dwarka Expressway": 9500,
        "Sector 81": 8900,
        "Sector 84": 8400,
        "Sector 102": 7800,
        "Sector 109": 7600
    }

    property_types = ["Apartment", "Villa", "Plot", "Commercial"]
    type_multipliers = {"Apartment": 1.0, "Villa": 1.40, "Plot": 1.20, "Commercial": 1.35}

    furnish_labels = ["Unfurnished", "Semi-Furnished", "Furnished"]
    furnish_multipliers = {"Unfurnished": 0.95, "Semi-Furnished": 1.05, "Furnished": 1.18}

    bhk_multipliers = {1: 0.92, 2: 0.98, 3: 1.05, 4: 1.15, 5: 1.28}

    data = []
    for _ in range(num_samples):
        locality = np.random.choice(localities)
        prop_type = np.random.choice(property_types, p=[0.70, 0.15, 0.10, 0.05])
        furnish = np.random.choice(furnish_labels, p=[0.25, 0.55, 0.20])

        bhk = int(np.random.choice([1, 2, 3, 4, 5], p=[0.08, 0.32, 0.42, 0.14, 0.04]))
        bathrooms = int(max(1, bhk + np.random.choice([-1, 0, 1], p=[0.2, 0.7, 0.1])))
        balconies = int(np.random.choice([1, 2, 3, 4], p=[0.1, 0.4, 0.4, 0.1]))

        base_sqft = bhk * 650 + np.random.randint(-100, 300)
        super_area = float(max(500, base_sqft))
        carpet_area = float(int(super_area * np.random.uniform(0.72, 0.80)))

        total_floors = int(np.random.choice([4, 12, 20, 30, 40], p=[0.15, 0.25, 0.35, 0.15, 0.10]))
        floor_num = int(min(np.random.randint(1, total_floors + 1), total_floors))

        rate = locality_rates.get(locality, 10500)
        bhk_m = bhk_multipliers.get(bhk, 1.0)
        furn_m = furnish_multipliers.get(furnish, 1.0)
        type_m = type_multipliers.get(prop_type, 1.0)
        floor_m = 1.0 + (floor_num / max(total_floors, 1)) * 0.12

        raw_price = super_area * rate * bhk_m * furn_m * type_m * floor_m
        min_price = float(round(raw_price, -4))

        lat = 28.4595 + np.random.uniform(-0.08, 0.08)
        lng = 77.0266 + np.random.uniform(-0.08, 0.08)

        data.append({
            "SUPERBUILTUP_SQFT": super_area,
            "CARPET_SQFT": carpet_area,
            "BEDROOM_NUM": bhk,
            "BATHROOM_NUM": bathrooms,
            "BALCONY_NUM": balconies,
            "FLOOR_NUM": floor_num,
            "TOTAL_FLOOR": total_floors,
            "LOCALITY_WO_CITY": locality,
            "PROPERTY_TYPE": prop_type,
            "FURNISH_LABEL": furnish,
            "LATITUDE": lat,
            "LONGITUDE": lng,
            "MIN_PRICE": min_price
        })

    return pd.DataFrame(data)

def train():
    df = generate_gurgaon_dataset(10000)

    X = df[[
        "SUPERBUILTUP_SQFT", "BEDROOM_NUM", "BATHROOM_NUM", "BALCONY_NUM",
        "FLOOR_NUM", "TOTAL_FLOOR", "LOCALITY_WO_CITY", "PROPERTY_TYPE",
        "FURNISH_LABEL", "LATITUDE", "LONGITUDE"
    ]]
    y = df["MIN_PRICE"]

    num_features = ["SUPERBUILTUP_SQFT", "BEDROOM_NUM", "BATHROOM_NUM", "BALCONY_NUM", "FLOOR_NUM", "TOTAL_FLOOR", "LATITUDE", "LONGITUDE"]
    cat_features = ["LOCALITY_WO_CITY", "PROPERTY_TYPE", "FURNISH_LABEL"]

    preprocessor = ColumnTransformer(transformers=[
        ("num", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), num_features),
        ("cat", Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("encoder", OneHotEncoder(handle_unknown="ignore"))]), cat_features)
    ])

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1))
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    pipeline.fit(X_train, y_train)

    preds = pipeline.predict(X_test)
    r2 = r2_score(y_test, preds)

    out_path = os.path.join(os.path.dirname(__file__), "predictor", "model.joblib")
    joblib.dump(pipeline, out_path)
    print(f"✅ Retrained Model on Gurgaon dataset! R2: {r2:.4f}, saved to {out_path}")

if __name__ == "__main__":
    train()
