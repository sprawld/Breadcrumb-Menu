document.getElementById('menu-logo').addEventListener('click',function(e) {
	e.stopPropagation();
	var menu = document.getElementById('menu');
	if (!menu.classList.contains('transition')) {
		menu.classList.toggle('horizontal');
		menu.classList.add('transition');
		menu.classList.remove('open');
		setTimeout(function() {
			menu.classList.remove('transition'); 
		},500);
	}
});

var menu = document.getElementById('menu');

[].forEach.call(document.querySelectorAll('#menu li'),function(el) {
	el.addEventListener('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		console.log( window.getComputedStyle(this,null).cursor );
		if(this.classList.contains('selected') && window.getComputedStyle(this,null).cursor == "pointer") {
			menu.classList.toggle('open');
		}
	});
});


[].forEach.call(document.querySelectorAll('#menu a'), function(el) {
	el.addEventListener('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		if(!menu.classList.contains('transition')) {
			var href = el.getAttribute('href');
			[].forEach.call(document.querySelectorAll('#menu li'), function(li) {
				li.classList.remove('main');
				li.classList.remove('selected');
				li.classList.remove('root');
				li.classList.remove('active');
			});
			
			var p = el.parentNode;
			if(p.classList.contains('nested')) p.classList.add('main');
			else {
				p.classList.add('active');
				p = p.parentNode.parentNode;
			}
			if(p.tagName == "LI") {
				p.classList.add('selected');
				p = p.parentNode.parentNode;
				while(p.tagName == "LI") {
					p.classList.add('root');
					p = p.parentNode.parentNode;
				}
			}
			
			menu.classList.remove('open');
			if(!menu.classList.contains('horizontal')) {
				menu.classList.add('horizontal');
				menu.classList.add('transition');
				setTimeout(function() {
					menu.classList.remove('transition');
				},500);
			}
			
			// After transition, load link. You can replace this with an Ajax Navigation
			if(!el.classList.contains('current')) setTimeout(function() {
				document.location.href = href;
			},600);
		}
	});
});
