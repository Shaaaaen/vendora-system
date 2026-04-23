# #OldVersion: 1.0 before 05 April 2026, now no more Country Table
# import requests
# import mysql.connector

# # Connect to MySQL
# db = mysql.connector.connect(
#     host="localhost",
#     user="root",
#     password="777",  
#     database="vendora_db"
# )

# cursor = db.cursor()

# # Fetch API Data 
# url = "https://restcountries.com/v3.1/all?fields=name,cca2,currencies"
# response = requests.get(url)
# countries_data = response.json()

# print("Fetching data from API...")

# # Insert Data
# currency_cache = {}

# for item in countries_data:
#     country_name = item.get('name', {}).get('common')
#     iso_code = item.get('cca2')

#     currencies = item.get('currencies', {})

#     for code, info in currencies.items():
#         currency_name = info.get('name')
#         symbol = info.get('symbol', '')

#         # Insert currency only if not already inserted
#         if code not in currency_cache:
#             cursor.execute(
#                 "SELECT currency_id FROM currency WHERE currency_code = %s",
#                 (code,)
#             )
#             result = cursor.fetchone()

#             if result:
#                 currency_id = result[0]
#             else:
#                 cursor.execute(
#                     "INSERT INTO currency (currency_name, currency_code, symbol) VALUES (%s, %s, %s)",
#                     (currency_name, code, symbol)
#                 )
#                 currency_id = cursor.lastrowid

#             currency_cache[code] = currency_id
#         else:
#             currency_id = currency_cache[code]

#         # Insert country
#         cursor.execute(
#             "INSERT INTO country (country_name, iso_code) VALUES (%s, %s)",
#             (country_name, iso_code)
#         )

#         break
# db.commit()
# print("Data imported successfully!")
# cursor.close()
# db.close()