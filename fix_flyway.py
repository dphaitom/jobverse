import psycopg2

# Connect to database
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="jobverse",
    user="postgres",
    password="postgres"
)

cursor = conn.cursor()

# Delete failed migration V6
cursor.execute("DELETE FROM flyway_schema_history WHERE version = '6';")

# Commit changes
conn.commit()

print("Deleted failed migration V6 from Flyway history")

# Check current migrations
cursor.execute("SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;")
migrations = cursor.fetchall()

print("\nCurrent migrations:")
for m in migrations:
    print(f"  V{m[0]} - {m[1]} - Success: {m[2]}")

cursor.close()
conn.close()
