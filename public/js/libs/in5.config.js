var useBookmark = false;
var bookmarkName = 'in5_bookmark_' + location.href.substr(location.host.length);
var touchEnabled = 'ontouchstart' in document.documentElement;
var clickEv = (touchEnabled) ? 'vclick' : 'click';
var useSwipe = false;
var pageMode = 'csv';
var multifile = false;
var arrowNav = false;
var sliderSettings = {};
var isIPad = (navigator.userAgent.indexOf("iPad") != -1);
var isIPhone = (navigator.userAgent.indexOf("iPhone") != -1);
var isBaker = (navigator.userAgent.indexOf("BakerFramework") != -1);
var nav = {};

function toggleAudio(btn){
	var elem = $(btn).siblings('audio')[0];
	if(elem == undefined) elem = $(btn).siblings().find('audio')[0];
	if(elem == undefined) return;
	try{
	var player = elem.player || elem;
	var media = player.media || elem;
	if(media.paused) player.play();
	else player.pause();
	} catch(e){}
}

function playMedia(dataID, from) {
	var elem = $('[data-id=' + dataID + ']')[0];
	if(elem == undefined) return;
	try{
		var player = elem.player || elem;
		player.play();
		if(from != undefined && from != -1) try{ setTimeout(function(){player.setCurrentTime(from);}, 500); }catch(e){}
	} catch(e){}
}

function pauseMedia(dataID, rewind) {
	var elem = $('[data-id=' + dataID + ']')[0];
	if(elem == undefined) return;
	try{
	var player = elem.player || elem;
	player.pause();
	} catch(e){}
}

function stopAllMedia(targ) {
	if(!targ) targ = document;
	$(targ).find('audio,video').each(function() {
		var media = $(this)[0];
		var player = media.player || media;
		try{player.pause(); media.currentTime = 0;}catch(e){}
	})
}

function onNewPage(e, data){
	if(!multifile) stopAllMedia();
	if(data == undefined || data.index == undefined) return;
	if(!multifile) {
		nav.current = data.index+1;
		if(useBookmark && localStorage) localStorage[bookmarkName] = nav.current;
	}
	$('.page').removeClass('activePage').eq(data.index).addClass('activePage').find('audio,video').filter('[data-autoplay]').each(function(i,elem) {
		var delay = parseFloat($(elem).attr('[data-autodelay]'))* 1000;
		var player = elem.player || elem;
		try{
		if(delay != 0) setTimeout(function(){player.play();}, delay);
		else player.play();
		}catch(e){}
	});
}

/*to do: check for when multiple pages are visible*/
function checkScroll(e, mode){
	if(window.scrolling) return;
	var docMin, docMax, docSpan, elemSpan, elemMin, elemMax, elemCenter;
	var vertMode = (mode === 'v');
	docMin = (vertMode) ? $(window).scrollTop() : $(window).scrollLeft();
	docMax = (vertMode) ? docMin + $(window).height(): docMin + $(window).width();
	docSpan = docMax - docMin;
    $('.pages .page').not('.activePage').each(function(index,elem) {
    	elemMin = (vertMode) ? $(elem).offset().top : $(elem).offset().left;
    	elemMax = (vertMode) ? elemMin + $(elem).height() : elemMin + $(elem).width();
    	elemSpan = elemMax - elemMin;
    	if(docSpan <= elemSpan) {
    		elemCenter = elemMin + elemSpan*.5;
    		if(elemCenter < docMax && elemCenter > docMin){
    			$(document).trigger('newPage', {index:$(elem).index()});
				return;
    		}
    	}else if((elemMax <= docMax) && (elemMin >= docMin)) {
    		$(document).trigger('newPage', {index:$(elem).index()});
    		return;
		}
    });
}

function nextState(dataID, loop) {
	
	
	var mso = $('[data-id=' + dataID + ']');
	var states = mso.first().children('.state');
	var current = states.siblings('.active').index();
	if(current+1 < states.length) {
		mso.each(function(index,elem) {	
			//@changed
				$(elem).removeClass('hidden').children('.state').removeClass('active').eq(current+1).addClass('active');
				//$('.active',elem).css('opacity',1);
				return;
			//@changeEnd
			if(elem.crossfade > 0 ) {
				var el = $(elem).removeClass('hidden');
				el.children('.state.active').show().fadeOut(elem.crossfade, function() { $(this).removeClass('active'); });
				el.children('.state').eq(current+1).addClass('active').hide().fadeIn(elem.crossfade);
			} else $(elem).removeClass('hidden').children('.state').removeClass('active').eq(current+1).addClass('active');
		});
	} else if(loop) {
		
		mso.each(function(index,elem) {
			//@changed
				$(elem).removeClass('hidden').children('.state').removeClass('active').first().addClass('active')
				//$('.active',elem).css('opacity',1);
				return;
			//@changeEnd
			if(elem.hasOwnProperty('loopcount')) {
				elem.loopcount++;
				if(elem.loopmax != -1 && elem.loopcount >= elem.loopmax) {
					stopSlideShow(elem);
					return;	
				}
			}
	 		if(elem.crossfade > 0) {
				var el = $(elem).removeClass('hidden');
				el.children('.state.active').show().fadeOut(elem.crossfade, function() { $(this).removeClass('active'); });
				el.children('.state').first().addClass('active').hide().fadeIn(elem.crossfade);
			} else $(elem).removeClass('hidden').children('.state').removeClass('active').first().addClass('active');
	 	});
	}
}

function prevState(dataID, loop) {
	var mso = $('[data-id=' + dataID + ']');
	var states = mso.first().children('.state');
	var current = states.siblings('.active').index();
	if(current-1 > -1) {
		mso.each(function(index,elem) {
	 		if(elem.crossfade > 0) {
				var el = $(elem).removeClass('hidden');
				el.children('.state.active').show().fadeOut(elem.crossfade, function() { $(this).removeClass('active'); });
				el.children('.state').eq(current-1).addClass('active').hide().fadeIn(elem.crossfade);
			} else $(elem).removeClass('hidden').children('.state').removeClass('active').eq(current-1).addClass('active');
		});
	} else if(loop) {
		mso.each(function(index,elem) {
			if(elem.hasOwnProperty('loopcount')) {
				elem.loopcount++;
				if(elem.loopmax != -1 && elem.loopcount >= elem.loopmax) {
					stopSlideShow(elem);
					return;	
				}
			}
	 		if(elem.crossfade > 0) {
				var el = $(elem).removeClass('hidden');
				el.children('.state.active').show().fadeOut(elem.crossfade, function() { $(this).removeClass('active');  });
				el.children('.state').last().addClass('active').hide().fadeIn(elem.crossfade);
			} else $(elem).removeClass('hidden').children('.state').removeClass('active').last().addClass('active');
	 	});
	}
}

function toState(dataID, stateIndex, restoreOnRollOut, restoreTarg){
	if(restoreOnRollOut) {
		var current = $('[data-id=' + dataID + ']').children('.state.active').first().index();
		$(restoreTarg).mouseout(function() { toState(dataID, current); });
	}
	$('[data-id=' + dataID + ']').each(function(index,elem) {
		if(elem.playing) stopSlideShow(elem);
		$(elem).children('.state').removeClass('active').hide().eq(stateIndex).addClass('active').show().parent('.mso').removeClass('hidden');
	});
}

function startSlideShow(elem){
	if(elem.playing) return;
	elem.playing = true;
	elem.loopcount = 0;
	var func = (elem.reverse) ? prevState : nextState;
	func($(elem).attr('data-id'), true );
	elem.playint = setInterval(function(){ func($(elem).attr('data-id'), true ); }, elem.duration*1000);
}

function stopSlideShow(elem) {
	elem.playing = false;
	if(elem.hasOwnProperty('playint')) clearInterval(elem.playint);
	$(elem).find('.state').css('display','').css('opacity','1');
}

function hide(dataID) { $('[data-id=' + dataID + ']').addClass('hidden'); }
function show(dataID) { $('[data-id=' + dataID + ']').removeClass('hidden'); }
function loadFrame(iframe){ iframe.src = $(iframe).attr('data-src'); }

function initPanZoom(){
	$('.panzoom').swipe( {
	pinchStatus:function(event, phase, direction, distance , duration , fingerCount, pinchZoom) {
		var c = $(this).find('.content');
		var cel = c[0];
		var cw = c.width();
		if(direction == 'out') distance *=-1;
		var targW = cw + distance*.5;
		var minW = cel.minW = $(this).width();
		cel.wval = (targW < minW) ? minW : ((targW > cel.maxW) ? cel.maxW : targW);
		newX = (minW - cel.wval) - cel.xval;
		newY = ($(this).height() - c.height()) - cel.yval;
		if(cel.wval == cel.minW) cel.xval=cel.yval=0;
		cel.reposition(this.xval,this.yval);
	},
	fingers:2,	
});
	$('.panzoom > .content').on('vmousedown', function(e){
		var tstamp = new Date().getTime();
		if(tstamp - this.stamp < 500) {
			$(this).removeAttr('style')
			return;
		}
		this.stamp = tstamp;
		var j = $(this);
		var pos = j.position();
		var container = j.parent('.panzoom').first();
		this.minX = container.width() - j.width();
		this.minY = container.height() - j.height();
		this.startX = e.pageX;
		this.startY = e.pageY;
		this.originX = pos.left;
		this.originY = pos.top;
		this.drag = true;
	}).on('vmousemove', function(e){
		e.preventDefault();
		if(!this.drag) return;
		var pageX = (e.pageX != undefined) ? e.pageX : e.originalEvent.touches[0].pageX;
		var pageY = (e.pageY != undefined) ? e.pageY : e.originalEvent.touches[0].pageY;
		var newX = this.originX + (pageX - this.startX);
		var newY = this.originY + (pageY - this.startY);
		this.reposition(newX,newY);
	}).on('vmouseup vmouseout mouseleave', function(e) { this.drag=false; }).each(function(index,el){
		var pos = $(el).position();
		el.stamp = new Date().getTime();
		el.xval = pos.left;
		el.yval = pos.top;
		el.wval = $(el).width();
		el.minW = $(el).parent('.panzoom').width();
		el.maxW = parseInt($(el).css('max-width'));
		el.reposition = function(newX,newY){
			var j = $(this);
			var container = j.parent('.panzoom').first();
			this.minX = container.width() - this.wval;
			this.minY = container.height() - j.height();
			this.xval = (newX > 0) ? 0 : ((newX < this.minX) ? this.minX : newX);
			this.yval = (newY > 0) ? 0 : ((newY < this.minY) ? this.minY : newY);
			$(this).attr('style','left:'+this.xval+"px !important;top:"+this.yval+"px !important; width:"+this.wval+"px !important;");
		};
	});
}

$(function(){
    $(document).on('assignIn5',function(){
        console.log('in5 init');
        
        $(document).on('newPage', function(e, data) { onNewPage(e, data); });
        if(!multifile && pageMode.substr(0,2) === 'cs') $(document).on('scroll', function(e){ checkScroll(e, pageMode.substr(2)); });
        if($('ul.thumbs').length) $('#in5footer').hide();
		
        $('[data-click-show]').each(function(index,el) {
            $(el).on(clickEv, function(e){ 
                e.preventDefault();
                $.each($(this).attr('data-click-show').split(','), function(i,val){ show(val); });
        }); });
        $('[data-click-hide]').each(function(index,el) {
            $(el).on(clickEv, function(e){ 
                e.preventDefault();
                $.each($(this).attr('data-click-hide').split(','), function(i,val){ hide(val); });
        }); });
        $('[data-click-next]').each(function(index,el) {
            $(el).on(clickEv, function(e){  
                var loop = ($(this).attr('data-loop') == '1');
                $.each($(this).attr('data-click-next').split(','), function(i,val){ nextState(val, loop); });
        }); });
        $('[data-click-prev]').each(function(index,el) {
            $(el).on(clickEv, function(e){  
                var loop = ($(this).attr('data-loop') == '1');
                $.each($(this).attr('data-click-prev').split(','), function(i,val){ prevState(val, loop); });
        }); });
       	/*
			$('[data-click-state]').each(function(index,el) {
				$(el).on(clickEv, function(e){  $.each($(this).attr('data-click-state').split(','), function(i,val){ 
					var targData = val.split(':');
					toState(targData[0], targData[1]); });
			}); });
		*/
		/*changed*/
		/*
			$('[data-click-play]').each(function(index,el) {
				$(el).on(clickEv, function(e){  $.each($(this).attr('data-click-play').split(','), function(i,val){ 
					var targData = val.split(':');
					playMedia(targData[0], targData[1]); });
			}); });
		*/
        $('[data-click-pause]').each(function(index,el) {
            $(el).on(clickEv, function(e){  $.each($(this).attr('data-click-pause').split(','), function(i,val){ 
                pauseMedia(val); });
        }); });
        $('[data-click-stop]').each(function(index,el) {
            $(el).on(clickEv, function(e){  $.each($(this).attr('data-click-stop').split(','), function(i,val){ 
                pauseMedia(val, true); });
        }); });
        $('[data-click-stopall]').each(function(index,el) {
            $(el).on(clickEv, function(e){  $.each($(this).attr('data-click-stopall').split(','), function(i,val){ 
                stopAllMedia(); });
        }); });
        $('.mso.slideshow').each(function(index,el) {
            var mso = $(el);
            el.duration = parseFloat(mso.attr('data-duration'));
            el.loopmax = parseInt(mso.attr('data-loopmax'));
            el.crossfade = parseFloat(mso.attr('data-crossfade')) * 1000;
            el.reverse = mso.attr('data-reverse') == '1';
            if(mso.attr('data-tapstart') == '1') {
                mso.on(clickEv, function(e) {
                if(!this.playing) startSlideShow(this);
                else stopSlideShow(this);
                });
            }
            if(mso.attr('data-autostart') == '1') {
                setTimeout(function(){ startSlideShow(el); }, parseFloat($(el).attr('data-autostartdelay'))*1000 );
            }
            if(mso.attr('data-useswipe') == '1') {
                mso.swipe({
                allowPageScroll:'vertical',
                fingers:1,
                swipe:function(event, direction, distance, duration, fingerCount) {
                    switch(direction) {
                        case "left":
                            if(el.reverse) prevState(mso.attr('data-id'), mso.attr('data-loopswipe') == '1');
                            else nextState(mso.attr('data-id'), mso.attr('data-loopswipe') == '1');
                            break;
                        case "right":
                            if(el.reverse) nextState(mso.attr('data-id'), mso.attr('data-loopswipe') == '1');
                            else prevState(mso.attr('data-id'), mso.attr('data-loopswipe') == '1');
                            break;		
                    }
                } });
            }
        });
        if($('.panzoom').length) initPanZoom();
        if($.colorbox) {
            $('.lightbox').colorbox({iframe:true, width:"80%", height:"80%"});
            $('.thumb').colorbox({maxWidth:"85%", maxHeight:"85%"});
        }
        $('img').on('dragstart', function(event) { event.preventDefault(); });
        $('.pageItem').each(function(){
            if($(this).is('[onclick]')){
                if(touchEnabled) {
                    /*this.setAttribute('touchstart', this.getAttribute('onclick'));
                    this.removeAttribute('onclick');*/
                } else this.style.cursor = 'pointer';
            }
        });
        $('.cover').on(clickEv, function() { loadFrame($(this).hide().siblings('iframe')[0]); }).filter('[data-delay]').each(function(index,el){
            setTimeout(function(){ $(el).trigger(clickEv); }, parseFloat($(el).attr('data-delay'))*1000 );
        });
        if(multifile){
            nav = { numPages:3,
            current:parseInt(location.href.split('/').pop().split('.html').join('')),
            back:function(ref){nav.to(nav.current-1);},
            next:function(ref){nav.to(nav.current+1);},
            to:function(n){
                if(n <= 0 || n > nav.numPages) return;
                var targPage = (n*.0001).toFixed(4).substr(2) + '.html';
                location.assign(targPage);
            } };
            $('nav #nextBtn').on(clickEv, function(){ nav.next(); });
            $('nav #backBtn').on(clickEv, function(){ nav.back(); });
            if(arrowNav && $('.page').length){
                $('nav:hidden, nav #backBtn, nav #nextBtn').show();
                if(nav.current == 1) $('nav #backBtn').hide();
                if(nav.current == nav.numPages) $('nav #nextBtn').hide();
            }
        } else if(pageMode.indexOf('liquid') != -1) {
            nav = { numPages:$('.pages .page').length,
            current:1,
            back:function(ref){nav.to(nav.current-1);},
            next:function(ref){nav.to(nav.current+1);},
            first:function(){nav.to(1);},
            last:function(){nav.to(nav.numPages);},
            to:function(n){
                if(n < 1 || n > nav.numPages) return;
                $(document).trigger('newPage', {index:n-1});
                if(n < 2) $('nav #backBtn:visible').hide();
                else $('nav #backBtn:hidden').show();
                if(n >= nav.numPages) $('nav #nextBtn:visible').hide();
                else $('nav #nextBtn:hidden').show();
            } };
            $('nav #nextBtn').on(clickEv, function(){ nav.next(); });
            $('nav #backBtn').on(clickEv, function(){ nav.back(); });
            if(arrowNav) $('nav:hidden').show();
            nav.to(getStartPage()); /*init*/
        } else if($.hasOwnProperty('scrollTo')){
            var dir = (pageMode[2] == 'h') ? 'x' : 'y';
            nav = { numPages:$('.pages .page').length,
                back:function(ref){var ind=$(ref).parent('.page').prev().index(); if(ind!=-1) nav.to(ind+1);},
                next:function(ref){var ind=$(ref).parent('.page').next().index(); if(ind!=-1) nav.to(ind+1);},
                first:function(){nav.to(1)},
                last:function(){nav.to(nav.numPages)},
                to:function(n){
                    window.scrolling = true;
                    $.scrollTo($('.page').eq(n-1)[0], 500, {axis:dir, onAfter:function(){window.scrolling=false}});
                    $(document).trigger('newPage', {index:n-1});} };
                nav.to(getStartPage());
        }
        if(useSwipe && !$('#container > ul.thumbs').length) {
            var container = $('#container');
            var vertMode = (pageMode.substr(0,1) == "v");
            container.swipe({
                allowPageScroll: (vertMode ? 'horizontal' : 'vertical'),
                fingers:1,
                excludedElements:$.fn.swipe.defaults.excludedElements+", .mejs-overlay-button, map",
                swipe:function(event, direction, distance, duration, fingerCount) {
                    switch(direction) {
                        case "left":
                            if(!vertMode) nav.next();
                            break;
                        case "right":
                            if(!vertMode) nav.back();
                            break;
                        case "up":
                            if(vertMode) nav.next();
                            break;
                        case "down":
                            if(vertMode) nav.back();
                            break;		
                    }
                }
            });
        }
    });
});    

$(window).load(function(){
	$('body').addClass('loaded');
	
	initMedia(sliderSettings != undefined);
});

function initMedia(hasSlider){
	if(isBaker) return;
	if(!$('video,audio').length) {
		if(multifile) $(document).trigger('newPage', {index:0});
	 	return;
	}
	if(!window.mejs || $('video,audio').mediaelementplayer == undefined) {
		setTimeout(function(){initMedia(hasSlider);}, 50);
		return;
	 }
	if(hasSlider && (isIPad || isIPhone)) $('video,audio').mediaelementplayer();
	else { $('video,audio').mediaelementplayer({pluginPath:'assets/media/',iPadUseNativeControls:true, iPhoneUseNativeControls:true, 
		AndroidUseNativeControls:true, enableKeyboard:false, success: function (mediaElement, domObject) {
				if(multifile) $(document).trigger('newPage', {index:0});
				else if(pageMode.indexOf('liquid') != -1 && mediaElement.pluginType) $(document).trigger('newPage', {index:$('.activePage').index()});
			}		
		});
	}
}

if(isBaker){
	$(window).on('blur', function(e){
		stopAllMedia(this.document);
	}).on('focus', function(e) {
		$(document).trigger('newPage', {index:0});
	});
}

function getStartPage(){
	if(multifile || !useBookmark || !localStorage) return 1;
	if(!localStorage[bookmarkName]) return 1;
	return localStorage[bookmarkName];
}


