'use strict'

/* 
Note to self: svgs exported from illustrator have conflicting colour attributes - 
found inside the <style> tag of the svg file, belonging to the type 'st0' .etc. Any 
colour corruption upon rendering in the browser is likely down to this issue. Either manually
change the svg file or select 'style attributes' from CSS properties upon saving in illustrator
*/

$(document).ready(function() {

	var s = Snap("#anim_example");
	
	var main = Snap.load("/user/pages/01.blog/snap_demo/first_example.svg", function (loadedFragment) {
		s.append(loadedFragment);

		var circle = Snap.select('.cls-2');	
		var triangle = Snap.select('.cls-3');	
		var square = Snap.select('.cls-4');	

		var sqr_bbox = square.getBBox();
		var tri_bbox = triangle.getBBox();

		function circle_jump () {
			circle.stop().animate({transform: 't0,-50'}, 500, mina.backout, function () {
				circle.animate({transform: 't0,0'}, 500, mina.backin);
			});
		}

		function sqr_rotate(){
			square.transform('');
			square.animate({ transform: "r180," + sqr_bbox.cx + ',' + sqr_bbox.cy}, 1500, mina.bounce);
		}

		function tri_scale () {
			triangle.transform('');
			triangle.stop().animate({transform: 's.5,.5'}, 300, mina.easeout, function() {
				triangle.stop().animate({transform: 's1,1'}, 700, mina.elastic);
			});
		}

		circle.mouseover(circle_jump);
		square.mouseover(sqr_rotate);
		triangle.mouseover(tri_scale);

	});
});
