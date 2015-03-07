/**
 * jQuery Maps Plugin 1.0 (2015-03-07)
 *
 * https://github.com/joshthompson/jquery-maps
 *
 * Copyright (c) 2015 Joshua Thompson
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 */

(function($){
	$.fn.journey = function(options) {
		
		// Sets overal object reference for later use
		var $this = this;
		var geocoder = new google.maps.Geocoder();

		// Set defaults
		var defaults = {
			complete: function() {},
			failure: function() {},
			mapOptions: {}
		};
		var options = jQuery.extend(defaults, options);

		// Sub function to run after journey lat and lng are loaded
		$this.render = function (map, journey) {
			var mapOptions = jQuery.extend({
				zoom: 11,
				center: journey[0],
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				mapTypeControl: false,
				streetViewControl: false,
				scrollwheel: options.scrollwheel
			}, options.mapOptions);
			var map = new google.maps.Map(map.css({backgroundImage: 'none'})[0], mapOptions);
			// Route
			var request = {
				waypoints: [],
				travelMode: google.maps.DirectionsTravelMode.DRIVING
			};
			$.each(journey, function(i, point) {
				if (i == 0) {
					request.origin = point;
				} else if (i == journey.length - 1) {
					request.destination = point;
				} else {
					request.waypoints.push({location: point, stopover: true});
				}
			});
			var directionsDisplay = new google.maps.DirectionsRenderer({map:map});
			var directionsService = new google.maps.DirectionsService();
			directionsService.route(request, function (response, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
						setTimeout(options.complete, 500, response, $this);
					});
					directionsDisplay.setDirections(response);
				} else {
					options.complete();
				}
			});
		};

		$this.noMap = function(map) {
			var noMapText = $this.attr("data-nomap") ? $this.attr("data-nomap"): "Apologies, no map available for this journey.";
			map.css({backgroundImage: 'none', height: 'auto'}).html("<div class='no-map'>" + noMapText + "</div>");
			options.failure();
		};

		// Set the function
		return this.each(function() {

			var map = $(this);
			if ($(this).is("[data-journey]")) {
				var journey_array = $.parseJSON($(this).attr('data-journey'));
				var journey = [];
				$.each(journey_array, function(i,point){
					journey.push(new google.maps.LatLng(point[0], point[1]));
				});
				$this.render(map, journey);
			} else {

				var pickup = $(this).attr('data-pickup');
				var via = $(this).attr('data-via') ? $(this).attr('data-via') : false;
				var destination = $(this).attr('data-destination');
				var journey = [];

				geocoder.geocode({address:pickup}, function (results, status) {
					if (status != "OK") {
						$this.noMap(map);
						return false;
					}
					journey.push(results[0].geometry.location);
					geocoder.geocode({address: via ? via : destination}, function (results, status) {
						if (status != "OK") {
							$this.noMap(map);
							return false;
						}
						journey.push(results[0].geometry.location);
						if (via) {
							geocoder.geocode({address:destination}, function (results, status) {
								if (status != "OK") {
									$this.noMap(map);
									return false;
								}
								journey.push(results[0].geometry.location);
								$this.render(map, journey);
							});
						} else {
							$this.render(map, journey);
						}
					});
				});

			}
		});
		
	};
})(jQuery);

(function($){
	$.fn.location = function(options) {
		
		// Set defaults
		var defaults = {
			mapOptions: {}
		};
		var options = jQuery.extend(defaults, options);

		// Set the function
		return this.each(function() {
			var center = new google.maps.LatLng(parseFloat($(this).attr('data-lat')), parseFloat($(this).attr('data-lng')));
			var mapOptions = jQuery.extend({
				zoom: $(this).attr('data-zoom') ? parseInt($(this).attr('data-zoom')) : 11,
				center: center,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				mapTypeControl: false,
				streetViewControl: false
			}, options.mapOptions);
			var target = $(this).is(".map") ? $(this) : $(this).find('.map');
			var map = new google.maps.Map(target.css({backgroundImage: 'none'})[0], mapOptions);
			if ($(this).attr("data-marker") != "false") {
				var marker = new google.maps.Marker({
					position: center,
					map: map
				});
			}
		});
		
	};
})(jQuery);