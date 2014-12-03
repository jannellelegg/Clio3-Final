state_1870.json : state_1870.shp
	@echo "Works"
	topojson -o state_1870.json -- state_1870.shp