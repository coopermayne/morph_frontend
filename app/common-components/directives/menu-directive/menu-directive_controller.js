'use strict';

var menuDirective = angular.module( 'menuDirective' );


menuDirective.controller( 'MenuDirectiveController', function( $rootScope, $scope, $state, $stateParams, Menu )
{

	// $scope.menuItems = [
	// 	{
	// 		title: 'Morphosis',
	// 		url: '',
	// 		sub: [
	// 			{
	// 				title: 'Awards',
	// 				items: ''
	// 			},
	// 			{
	// 				title: 'People',
	// 				items: ''
	// 			},
	// 			{
	// 				title: 'Media',
	// 				items: [ 'Publications', 'Bibliography', 'Exhibitions', 'Video' ]
	// 			}
	// 		]
	// 	},
	// 	{
	// 		title: 'Architecture',
	// 		url: 'architecture',
	// 		sorting: [
	// 			{
	// 				title: 'A-Z',
	// 				items: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	// 			},
	// 			{
	// 				title: 'Year',
	// 				items: [ '1970-1979', '1980-1989', '1990-1999', '2000-2009', '2010-2019' ]
	// 			},
	// 			{
	// 				title: 'Type',
	// 				items: [ 'Commercial', 'Office', 'Culture', 'Education & Health', 'Residential', 'Multi-Family', 'Private Residence', 'Government' ]
	// 			},
	// 			{
	// 				title: 'Location',
	// 				items: []
	// 			}
	// 		]
	// 	},
	// 	{
	// 		title: 'Urban Design',
	// 		url: 'urban-design',
	// 		sorting: [
	// 			{
	// 				title: 'A-Z',
	// 				items: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	// 			},
	// 			{
	// 				title: 'Location',
	// 				items: ''
	// 			},
	// 			{
	// 				title: 'Year',
	// 				items: [ '1970-1979', '1980-1989', '1990-1999', '2000-2009', '2010-2019' ]
	// 			}
	// 		]
	// 	},
	// 	{
	// 		title: 'Tangents',
	// 		url: 'tangents',
	// 		sorting: [
	// 		{
	// 			title: 'A-Z',
	// 			items: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	// 		},
	// 		{
	// 			title: 'Year',
	// 			items: [ '1970-1979', '1980-1989', '1990-1999', '2000-2009', '2010-2019' ]
	// 		}
	// 		]
	// 	},
	// 	{
	// 		title: 'Research',
	// 		url: 'research'
	// 	},
	// 	{
	// 		title: 'Media',
	// 		url: 'media'
	// 	},
	// 	{
	// 		title: 'News',
	// 		url: 'news'
	// 	}
	// ];

	$scope.menuItems = Menu.query();

	$scope.stateParams = $stateParams;

	// Initialize as false
	$scope.displaySorting = $stateParams.q;

	$scope.toggleSort = function( input ) {
		if ( $scope.displaySorting ) {
			$scope.displaySorting = false;
			// $stateParams.q = null;
		} else {
			// $scope.displaySorting = input;
			$stateParams.sortingType = input.toLowerCase();

		}
	};


	console.log( 'MenuDirectiveController active!' );

} );
