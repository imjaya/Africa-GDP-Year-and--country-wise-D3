# Africa-GDP-Year-and--country-wise-D3
An interactive D3 project to plot the scatter plot of the selected country for a set of years

Live firebase deployement of the project: https://africa-gdp-countrywise-d3js.web.app/

# Linking D3 Charts and Adding Interactivity

The purpose of this homework was to give a practice to linking separate visualizations together in D3.

* Update a second chart based on interaction within the first
* Use mouse events
* Update data and color scheme via html elements
* Add tooltips to charts
* Create a legend
* Stylize axes on a chart

## Data Description

The data for this assignment comes from the World Bank ([link](https://databank.worldbank.org/source/africa-development-indicators)). It shows, from 1960-2011, the GDP per capita of countries in Africa (based on current USD). 

* `data/Data_Extract_From_Africa_Development_Indicators.xlsx` is the excel file generated and downloaded from The World Bank website using their DataBank interface.
* `data/africa_gdp_per_capita.csv` is the formatted csv file you'll use in the interface. Note that some countries have misssing data for some years (stored as empty strings).
* `data/africa.geojson` is the geojson file used to create the map (ie, the country shapes).



Navigate to the project folder and run the following commands:

pip install simple-http-server 

python -m SimpleHTTPServer 8080
