
// ----------------------
//    Breadcrumb Menu
// ----------------------

function Menu(obj,url) {
	this.init(obj,url);
}

Menu.prototype = {
	state: {
		scroll: false,
		resize: false,
		transition:false,
		next:null,
		hover:false,
		open:true,
		mainLeft: null,
		height: 50,
		hoverTop: null,
		hoverLeft: null,
	},
	layout: {
		iconSmall: 100,
		iconBig: [175,25],
		breadcrumb: 50,
		peer: 30,
		peerFirst: 15,
		height: 50,
		navHeight: 50,
		openHeight: 33,
		openPad: 40,
	},
	nav: null,
	init: function(obj,url) {
		var self = this;
	
		var href = {};
		obj.find('a').each(function() {
			href[$(this).attr('href')] = $(this).parent();
		});
		
		this.obj = {
			menu: obj,
			ulRoot: obj.find('> ul'),
			liRoot: obj.find('> ul > li'),
			ul: obj.find('ul'),
			li: obj.find('li'),
			a: href,
		};

		var getMenuSize = function(list,openLeft,openTop,closedLeft) {
			var maxWidth = 0,
				left = closedLeft + self.layout.peerFirst,
				top = openTop;
			list.find('> li').each(function() {
				var liWidth = $(this).width();
				$(this).data({openLeft:openLeft,openTop:top, width:liWidth,closedWidth:liWidth+self.layout.peer,closedLeft: left,breadLeft: closedLeft});
				if(maxWidth < liWidth+self.layout.openPad) maxWidth = liWidth+self.layout.openPad;
				top += self.layout.openHeight;
				left += liWidth + self.layout.peer;
				
			});
			list.data({openWidth:maxWidth,openBottom:top,openTop:openTop,openLeft:openLeft,closedWidth:left,closedLeft: closedLeft})
			list.find('> li').each(function() {
				var ul = $(this).find('> ul');
				if(ul.length) {
					$(this).addClass('nested');
					var openTop = $(this).data('openTop');
					var cWidth = closedLeft + $(this).data('width') + self.layout.breadcrumb;
					getMenuSize(ul, (openLeft+maxWidth),openTop, cWidth);
				}
			});	
		};
		
		
		getMenuSize( self.obj.ulRoot, self.layout.iconBig[0], self.layout.iconBig[1], self.layout.iconSmall );

		self.setMain($('main'));

		if( url == undefined || url == "/" || self.obj.main.hasClass('index') ) {
			self.state.open = true;
			obj.addClass('init open');
			self.obj.ul.each(function() {
				self.openUp($(this));
			});
			self.reflow();
			obj.removeClass('init');
			self.obj.liRoot.addClass('show');
			setTimeout(function() {
				obj.removeClass('init');
				self.selectOpen();
			},500);
			
		} else {
			if(self.obj.a.hasOwnProperty(url)) {
				self.obj.a[url].addClass('active');
			} 
			self.state.open = false;
			obj.addClass('init');
			self.setClosed();
			setTimeout(function() {
				obj.removeClass('init');
			},500);
		}

		self.obj.menu.find(' > div img').on('click',function(e) {
			e.stopPropagation();
			e.preventDefault();
			if(self.state.open && !self.obj.main.hasClass('index')) {
				
				self.setClosed();
			}
			else self.setOpen();
		});


		$(window).on('resize',function() {
			if(self.resizeTimeout) clearTimeout(self.resizeTimeout);
			self.resizeTimeout = setTimeout(function() {
				if(self.state.open) self.selectOpen();
				else self.selectClosed();			
			},250);
		});

		
		self.obj.menu.on('mouseenter',function() {
			if(self.nav) clearTimeout(self.nav);
			self.navMouseEnter();
		}).on('mouseleave',function() {
			self.nav = setTimeout(function() {
				self.navMouseLeave();
				self.nav = null;
			},250);
		});

	},
	
	reflow: function() {
		this.obj.menu[0].offsetHeight;
	},
	
	setMain: function(main) {
		
		var self = this;
		self.obj.main = main;
		self.scrollTop = main.scrollTop();
		main.on('scroll',function(e){			
			
			if(!self.state.scroll) {
				setTimeout(function() {
					self.state.scroll = false;
				},250);
				self.state.scroll = true;
				var scrollTop = self.obj.main.scrollTop();
				if(Math.abs(self.scrollTop - scrollTop) <= 50) return;
				if (scrollTop > self.scrollTop && scrollTop > 200){
					// Scroll Down (hide #menu)
					self.obj.menu.addClass('scroll');
				} else {
					// Scroll Up (show #menu)
					self.obj.menu.removeClass('scroll');
				}
				self.scrollTop = scrollTop;
			}			
		}).focus();
		
	},
	
	setClick: function(ajax) {
		var self = this;
		self.obj.menu.find('a').on('click',function(e) {
			e.preventDefault();
			e.stopPropagation();
			var li = $(this).parent();
			self.setActive(li);
			if($.isFunction(ajax)) ajax($(this));
			else {
				if(self.state.open) {
					self.state.open = false;
					self.obj.menu.removeClass('open').addClass('closed');
					
					self.obj.li.addClass('show');
				}
				self.selectClosed();
				self.obj.menu.removeClass('scroll');
				self.navMouseLeave();
				
			}
		});

	},
	

	
	setActive: function(obj) {
		
		this.obj.ulRoot.find('li.active').removeClass('active');
		obj.addClass('active');
	},
	
	selectActive: function(url) {
		
		var self = this;
		if(self.state.transition == true) {
			
			
			self.state.next = url;
			return;
		}
		self.state.transition = true;
		
		setTimeout(function() {
			
			self.state.transition = false;
			if(self.state.next !== null) {
				var nextURL = self.state.next;
				
				self.state.next = null;
				self.selectActive(nextURL);
			}
		},1000);
		if(self.state.open && url !== "/") {
			self.state.open = false;
			self.obj.menu.removeClass('open').addClass('closed');
			self.obj.li.addClass('show');
		}

		if(this.obj.a.hasOwnProperty(url)) {
			
			self.setActive(self.obj.a[url]);
			self.selectClosed();
			self.obj.menu.removeClass('scroll');
			self.navMouseLeave();
			return true;
		} else if(url == "/") {
			self.setOpen();
			return true;
		} else return false;
	},
	

	navMouseEnter: function() {
		var self = this;
		if(self.state.open == false) {
			
			self.state.hover = true;
			self.obj.menu.addClass('hover').removeClass('unhover scroll').css({height:self.state.height+'px'});
			if(self.state.mainLeft) {
				self.obj.ulRoot.find('li.active').css({left:self.state.hoverLeft,top:self.state.hoverTop});
			}
		}
	},


	navMouseLeave: function() {
		var self = this;
		if(this.state.open == false) {
			
			self.state.hover = false;
			self.obj.menu.addClass('unhover').removeClass('scroll hover').css({height:self.layout.navHeight+'px'});
			if(self.state.mainLeft) {
				self.obj.ulRoot.find('li.active').css({left:self.state.mainLeft,top:0});
			}
			setTimeout(function() {
				if(!self.state.hover) self.obj.menu.removeClass('unhover');
			},500);
		}
	},

	openUp: function(obj) {
		
		obj.css({
			top: 0,
			left: obj.data('openLeft') + 'px',
			height: obj.data('openBottom') + 'px',
			right: 0,
		});
		var width = obj.data('openWidth');
		obj.find('> li').each(function() {
			$(this).css({
				top: $(this).data('openTop') + 'px',
				left: $(this).data('openLeft') + 'px',
				width: width + 'px',
			});
		});
	},

	setOpen: function() {
		
		var self = this;
		self.state.open = true;
		self.obj.menu.addClass('open').removeClass('closed');
		self.obj.ulRoot.each(function() {
				
				self.openUp($(this));
			});
		self.reflow();
		self.obj.liRoot.addClass('show');
		self.obj.ulRoot.find('ul').each(function() {
			
			self.openUp($(this));
		});
		setTimeout(function() {
			self.obj.menu.find('li.old').removeClass('old');

			self.selectOpen();
		},500);
	},

	selectOpen: function() {
		var vWidth = window.innerWidth,
			vHeight = window.innerHeight;
		this.obj.ulRoot.find('ul').each(function() {
			if( $(this).data('openLeft') + $(this).data('openWidth') > vWidth || $(this).data('openBottom') > vHeight) {
				$(this).addClass('offscreen');
				$(this).parent().addClass('offscreen');
			} else {
				$(this).removeClass('offscreen');
				$(this).parent().removeClass('offscreen');
			}
		});	
	},

	setClosed: function() {
		var self = this;
		self.state.open = false;
		
		self.obj.li.addClass('show');
		
		self.reflow();
		
		self.selectClosed();
		self.obj.menu.removeClass('open').addClass('closed');
	},

	selectClosed: function() {
		var self = this;
		var selectBreadcrumb = function(list,left,top,vWidth) {
			var pLeft = null, pTop = null;
			if(top>0) {
				var listLeft = [];
				list.forEach(function(a,b,c) {
					var cLeft = a.data('breadLeft')+left,
						cWidth = a.data('closedWidth');
					if(cLeft + cWidth > vWidth) {
						top += self.layout.navHeight;
						left = - $(this).data('closedLeft');
						cLeft = 0;
						var tWidth = vWidth - listLeft[listLeft.length-1] + 50;
						if(b>0) c[b-1].css({width:tWidth+'px'});
					}
					a.css({left: cLeft+'px',top:top+'px',width:cWidth+'px'}).addClass('hidden');
					listLeft.push(cLeft);
					if(a.hasClass('active')) {
						pLeft = cLeft;
						pTop = top;
					}
				});
				var lastWidth = vWidth - listLeft[list.length-1] + 50;
				list[list.length-1].css({width:lastWidth+'px'});
			} else {
				list.forEach(function(a) {
					a.css({left: (a.data('breadLeft')+left)+'px',top:0,width:a.data('closedWidth')+'px'}).removeClass('hidden');
				});
			}
			return [top,pLeft,pTop];
		};

		var selectList = function(ul,left,top,vWidth) {
			var pLeft = null, pTop = null;
			if(top>0) {
				ul.find('> li').each(function() {
					var cLeft = $(this).data('closedLeft') + left;
					if(cLeft + $(this).data('closedWidth') > vWidth) {
						top += self.layout.navHeight;
						left = self.layout.peerFirst - $(this).data('closedLeft');
						cLeft = self.layout.peerFirst;
					}
					$(this).css({left: cLeft+'px',top:top+'px',width:$(this).data('closedWidth')+'px'}).addClass('hidden');
					if($(this).hasClass('active')) {
						pLeft = cLeft;
						pTop = top;
					}
				});
			} else {
				ul.find('> li').each(function() {
					$(this).css({left: ($(this).data('closedLeft') + left)+'px',top:0,width:$(this).data('closedWidth')+'px'}).removeClass('hidden');
				});
			}
			return [top,pLeft,pTop];
		};


		var li = self.obj.menu.find('li.active').first(),
			vWidth = window.innerWidth,
			nested = li.hasClass('nested'),
			height = 0,
			obj = nested ? li : li.parent().parent(),
			ul = obj.find('> ul'),
			ulLeft = ul.data('closedLeft'),
			ulWidth = ul.data('closedWidth'),
			breadcrumb= [],
			ulList = [ul],
			depth = 1,
			top = 0;
			ul.find('> li')
			.addClass('new select')
			.removeClass('root');
		while(obj.prop('tagName') == "LI") {
			obj.addClass('new root').removeClass('select');
			breadcrumb.unshift(obj);
			
			
			ulList.push(obj.parent());
			obj = obj.parent().parent();
			depth++;
		}
		setTimeout(function() {
			ulList.forEach(function(a,b) {
				a.attr('data-depth',b);
			});
		},500);
		self.obj.menu.removeClass('small smallNest');
		if(ulLeft > vWidth) {
			
			
			var bread = selectBreadcrumb(breadcrumb,-self.layout.iconSmall,self.layout.navHeight,vWidth);
			var data = selectList(ul,-ulLeft,bread[0]+self.layout.navHeight,vWidth);
			top = data[0];
			if(nested) {
				self.state.mainLeft = self.layout.iconSmall;
				self.state.hoverLeft = bread[1];
				self.state.hoverTop = bread[2];
				
				self.obj.menu.addClass('smallNest');
			} else {
				self.state.hoverLeft = data[1];
				self.state.hoverTop = data[2];
				self.obj.menu.addClass('small');
				self.state.mainLeft = self.layout.iconSmall;
			}
		} else if(ulWidth > vWidth) {
			
			
			if(nested) {
				
				selectBreadcrumb(breadcrumb,0,0,vWidth);
				var data = selectList(ul,-ulLeft,self.layout.navHeight,vWidth);
				top = data[0];
				self.state.hoverLeft = null;
				self.state.hoverTop = null;
				self.state.mainLeft = null;

			} else {
				if(ulLeft + li.data('width') + self.layout.peerFirst < vWidth) {
					
					selectBreadcrumb(breadcrumb,0,0,vWidth);
					var data = selectList(ul,-ulLeft,self.layout.navHeight,vWidth);
					top = data[0];
					self.state.hoverLeft = data[1];
					self.state.hoverTop = data[2];
					self.state.mainLeft = ulLeft + self.layout.peerFirst;
				} else {
					
					var bread = selectBreadcrumb(breadcrumb,-self.layout.iconSmall,self.layout.navHeight,vWidth);
					var data = selectList(ul,-ulLeft,bread[0]+self.layout.navHeight,vWidth);
					top = data[0];
					self.obj.menu.addClass('small');
					self.state.hoverLeft = data[1];
					self.state.hoverTop = data[2];
					self.state.mainLeft = self.layout.iconSmall;
				}
			}
		} else {
			selectBreadcrumb(breadcrumb,0,0,vWidth);
			var data = selectList(ul,0,0,vWidth);
			top = data[0];
			self.state.hoverLeft = null;
			self.state.hoverTop = null;
			self.state.mainLeft = null;
		}
		if(top > 0) self.state.height = top+self.layout.navHeight;
		else self.state.height = self.layout.navHeight;
		if( self.state.mainLeft ) {
			li.css({left:self.state.mainLeft+'px',top:0}).removeClass('hidden');
		}
		self.obj.menu.attr('data-depth',depth);
		self.obj.menu.find('li.old:not(.new), li.show:not(.new)').removeClass('select root show');

		setTimeout(function() {
			self.obj.menu.find('li.new:not(.old)').addClass('show');
			self.obj.menu.find('li.old').removeClass('old');
			self.obj.menu.find('li.new').removeClass('new').addClass('old');
			
		},500);

	},

};
