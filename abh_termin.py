
import requests
from bs4 import BeautifulSoup

def check_available_slots():
	# URL of the Ausländerbehörde website
	url = 'https://www.qtermin.de/qtermin-stadtheilbronn-abh'

	# Send a GET request to the website
	response = requests.get(url)

	# Check if the request was successful
	if response.status_code == 200:
		with open('responce.txt', 'w') as f:
			f.write(response.text)

		# Parse the HTML content of the page
		soup = BeautifulSoup(response.text, 'html.parser')
		time = soup.find_all(text="€")
		# print(time.text)
		with open('time.txt', 'w') as f:
			f.write(time.text)

	# Check if the request was successful
	# if response.status_code == 200:
	#     # Parse the HTML content of the page
	#     soup = BeautifulSoup(response.text, 'html.parser')

	#     # Find the element containing the available time slots
	#     time_slots = soup.find_all('div', class_='time-slot')

	#     # Process the time slots
	#     for slot in time_slots:
	#         # Extract relevant information from the time slot element
	#         date = slot.find('span', class_='date').text
	#         time = slot.find('span', class_='time').text

	#         # Check if this time slot meets your criteria (e.g., specific date range)
	#         # You can add your logic here
			
	#         # Print or log the available time slots
	#         print(f"Date: {date}, Time: {time}")

	else:
		print("Failed to retrieve data from the website.")

# Call the function to check for available time slots
check_available_slots()
