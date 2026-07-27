import databases
from config.settings import DATABASE_URL

database = databases.Database(DATABASE_URL)
