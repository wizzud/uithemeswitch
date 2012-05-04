/** @preserve jquery.uithemeswitch.js v1.0.2
 * requires jquery v1.4.3+, jquery.ui.accordion.js, and optionally jquery.cookie.js
 */
/*global jQuery, document, window */
/*jslint white:true, regexp:true, plusplus:true, sloppy:true, forin:true*/

/* Theme Switcher for jQuery UI
 *
 * Dual licensed under MIT and GPL-2.0
 * - http://www.opensource.org/licenses/MIT
 * - http://www.opensource.org/licenses/GPL-2.0
 * 
 * IMPORTANT : to use cookies, you need to include Klaus Hartl's cookie plugin for jQuery...
 *             https://github.com/carhartl/jquery-cookie
 * 
 * - switcher is made into an accordion and styled according to page's current theme (no accordion, no switcher!)
 * - places theme stylesheets immediately after each other, allowing site stylesheets to supercede and override all themes
 * - handles recognised theme links coded into the page (as well as a loadTheme option)
 * - uses data-uts='{options object}' attribute, and data-uts-[option name]=value attributes if set on target element
 * - handles multiple theme switcher instances on a page
 * - can have small or large (the default) theme thumbnails (compact option)
 * - can intercept and prevent a switch (onSelect option)
 * - can set all cookie options
 * - can use external cookie(?) function for saving selected theme
 * - UI version defaults to jQuery.ui.version, but can be changed from options
 *     NOTE if your page loads a 'latest' version (eg. .../jqueryui/1/...) you should set this option to '1' also!
 * - can provide post-switch processing (onLoad option)
 * - class on BODY indicates current theme ('uithemeswitch-theme-' + THEME, where THEME is the theme name lowercased,
 *     with anything non-alnumeric replaced by hyphens
 *     eg 'uithemeswitch-theme-south-st', or 'uithemeswitch-theme-my-custom-theme')
 * - themes and thumbnails are sourced from CDN (but don't have to be)
 * - theme list can be modified, even adding your own
 * - optional 'Reset Theme' and 'Remember' options (with 'on___()' callback options)
 * - options can be preset (eg. $.uithemeswitch.options.loadTheme = 'Black Tie';)
 * 
 * Usage :
 *   $(__).uithemeswitch(options, themeName);
 *   where options is optional and one of:
 *   - an object of option settings : creates the theme switcher on the selected element(s)
 *   - a string, "destroy" : destroys the selected theme switcher(s) previously created (without resetting styles!)
 *   - a string, "reset" : removes styles loaded by themeswitcher, and removes cookie
 *   - a string, "select", and a themeName (eg. "UI Lightness") : selectes the theme if available
 * 
 * Sample : 
 *   <!DOCTYPE html>
 *   <html>
 *   <head>
 *     <link type='text/css' rel='stylesheet' href='//ajax.googleapis.com/ajax/libs/jqueryui/1.8.17/themes/base/jquery-ui.css' />
 *     
 *     <!-- you need the uithemeswitch stylesheet, AFTER the jquery UI stylesheet(s)... -->
 *     <link type='text/css' rel='stylesheet' href='jquery.uithemeswitch.css' />
 *     
 *     <!-- you need jQuery, plus ui-accordion and its dependencies... -->
 *     <script type='text/javascript' src='//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js'></script>
 *     <script type='text/javascript' src='//ajax.googleapis.com/ajax/libs/jqueryui/1.8.17/jquery-ui.min.js'></script>
 *     
 *     <!-- you need the uithemeswitch code... -->
 *     <script type='text/javascript' src='jquery.uithemeswitch.min.js'></script>
 *     <!-- if you want to use cookies to save the selected theme... -->
 *     <!-- <script type='text/javascript' src='jquery.cookie.js'></script> -->
 *     
 *     <script type='text/javascript'>
 *     jQuery(function($){
 *       $('#myThemeSwitchers').uithemeswitch();
 *       $('.myThemeSwitchers').uithemeswitch({sorted:false});
 *     });
 *     </script>
 *     
 *     <style type='text/css'>
 *       #myThemeSwitchers { position: absolute; top: 0; left: 0; z-index: 5; }
 *       .myThemeSwitchers { position: relative; float: left; margin: 10px 30px 0 10px; }
 *       body.uithemeswitch-theme-dot-luv .ui-widget { font-size: 1.1em; }
 *     </style>
 *   </head>
 *   <body>
 *   
 *     <div id='myThemeSwitchers'>
 *     
 *       <div class='myThemeSwitchers'></div>
 *       <div class='myThemeSwitchers' data-uts='{"showRemember":1,"closeMouseout":"widget","themeRollover":0,"sorted":"false"}'></div>
 *       <div class='myThemeSwitchers' data-uts-compact='true' data-uts-show-reset='1' data-uts-show-remember='1'></div>
 *   
 *   <!-- to preload a theme in the absence of a cookie-saved theme...
 *       <div class='myThemeSwitchers' data-uts-load-theme='Dark Hive'></div>
 *   -->
 *   
 *     </div>
 *   
 *   </body>
 *   </html>
 *
 * Where and how you place the Theme Switcher is completely up to you.
 *
 * NOTE re 'remember' option:
 * As of 26 May 2011, UK law (from EU directive) basically requires that nothing be stored on the user's computer
 * without the user's permission (eg. cookies), and there is a 1 year grace period for websites to comply. However,
 * it is not an all-encompassing requirement, although the 'exceptions' can be a bit hard to determine : for example,
 * if you visit an online shop, and the shop stores a cookie on your PC that is purely used to facilitate storage
 * of basket contents and shop processing, etc, then that (it would seem) is okay, no permission is required. But if
 * the information gathered/stored goes beyond what the shop requires for its operation, eg. some form of analytics?,
 * then the question of whether permission is required or not comes into play again. It would therefore seem that
 * even (temporarily) storing something like a theme preference would require permission, hence the inclusion of the
 * 'remember' checkbox (options.showRemember). The reasoning I have used is that if the preference already exists
 * on the user's computer then assume that permission has already been granted (checkbox checked); otherwise, assume
 * that it hasn't (checkbox unchecked). The checking of the checkbox by the user is taken as implicit permission, since
 * this plugin does not go to the lengths of explaining the consequences of doing so to the user ... I figure that's
 * down to the website content (T&C's?), if that is deemed to be necessary.
 * 
 * What are the options for 'remembering'?
 * The simplest one : just include Klaus Hartl's cookie plugin. A simple cookie, with a string value for the name of
 *                    the current theme, will be stored on the user's computer.
 *                    NOTE : this plugin does NOT include the $.cookie plugin! You will need to include it yourself.
 */
(function($){

if(!$.uithemeswitch){
    $.uithemeswitch = {
		version: '1.0.2',
		options: {
			uiVersion: $.ui.version, //picked up from loaded ui, but overridable in case a 'latest' url is used for css (eg. like .../jqueryui/1/...)
			compact: 0, // set true for small thumbnail; small = 30x27 px, large (default) = 90x80 px
			loadTheme: '', // set to a theme name (eg. 'UI Lightness') to initially load that theme (in the absence of a cookie-saved theme)
			textPrompt: 'Switch Theme',    // text displayed when current theme isn't (or can't be) displayed
			textCurrent: 'Theme: ',        // text preceding the current theme's name
			textReset: 'Reset Theme',      // text on the reset option
			textRemember: 'Remember',      // text on the remember option (in front of the remember checkbox)
			closeSelect: 1, // (instant) collapse of the list on selection of a new theme or a reset
			closeMouseout: 'all', // collapses the list on mouseout of either the entire switcher (='all', which is the default) or the content only(='list'); anything else prevents closure on mouseout (ie. re-click the header to close)
			cookie: 1,                     // default is to use $.cookie (Klaus Hartl) if found; set false(ish) to not use cookies, or set to a function to use your own [function as a getter receives 1 arg : cookie object; function as a setter receives 3 args : cookie object, theme name, theme object]
			cookieName: 'jquery-ui-theme', // String
			cookieExpires: null,           // null (for end of session), a Date, or a number of days (negative deletes cookie)
			cookiePath: '',                // String folder (eg. '/' or '/sub-folder/') ... $.cookie defaults it to page's current path
			cookieDomain: '',              // String (eg. 'www.domain.com') ... $.cookie defaults it to page's current domain
			cookieSecure: window.location.protocol === 'https:', // Boolean, true if secure
			showRemember: 0, // show the remember item (at top of list of themes)
			forceRemember: null, // set true (boolean) or false (boolean) to override the default setting of the remember checkbox
			keep: 2, // maximum number of historic themes to keep loaded
			sorted: 1, // sort the themes alphabetically
			showReset: 0, // show the reset item (above list of themes)
			themeRollover: 1, // only show the theme in the header text on mouse rollover
			onLoad: $.noop, // function, called after selected theme has been requested; parameters : new theme, previous theme; NOT called on initial load (via either cookie or loadTheme option)
			onRemember: $.noop, // function, called when Remember is clicked; parameters : current state of Remember; return false to prevent the change of state
			onReset: $.noop, // function, called when Reset Theme is clicked; parameters : current theme, reset theme, current state of Remember; return false to prevent any action being taken
			onSelect: $.noop // function, called when a new theme is selected; parameters : selected theme, current theme, current state of Remember; return false to prevent selection
		},
		cssCDN: '//ajax.googleapis.com/ajax/libs/jqueryui/{uiVersion}/themes/{folder}/jquery-ui.css',
		thumbCDN: 'http://static.jquery.com/ui/themeroller/images/themeGallery/theme_{thumbsize}_{thumb}.png',
		themes: {
			// 'theme name' : { folder : [name of theme folder] , thumb : [theme-specific part of image file name] }
			// where
			//   - 'folder' defaults to 'theme name'.toLowerCase().replace(/\s+/g, '-'), then
			//   - 'thumb' defaults to 'folder'.replace(/-/g, '_')
			// To add your own, non-CDN-hosted themes, supply a full url (absolute, or relative to page) for both 'folder'
			// and 'thumb', AND (vital!) add cdn:false
			// eg.
			//   'My Theme' : { folder: 'http://www.mysite.com/my_ui_theme/jquery-ui.css',
			//                  thumb: 'http://www.mysite.com/my_ui_theme/themethumbnail.png',
			//                  cdn: false
			//                }
			//   [ NB: for consistency, keep your thumbnails to the standard 30x27 and/or 90x80 ]
			// To remove a theme, either remove it from the themes object or set it to null/false (eg. 'UI Lightness': null)
			'UI Lightness'    : { thumb : 'ui_light' },
			'UI Darkness'     : { thumb : 'ui_dark' },
			'Smoothness'      : {},
			'Start'           : { thumb : 'start_menu' },
			'Redmond'         : { thumb : 'windoze' },
			'Sunny'           : {},
			'Overcast'        : {},
			'Le Frog'         : {},
			'Flick'           : {},
			'Pepper Grinder'  : {},
			'Eggplant'        : {},
			'Dark Hive'       : {},
			'Cupertino'       : {},
			'South St'        : { folder : 'south-street' },
			'Blitzer'         : {},
			'Humanity'        : {},
			'Hot Sneaks'      : {},
			'Excite Bike'     : {},
			'Vader'           : { thumb : 'black_matte' },
			'Dot Luv'         : {},
			'Mint Choc'       : { thumb : 'mint_choco' },
			'Black Tie'       : {},
			'Trontastic'      : {},
			'Swanky Purse'    : {}
		},
		instCt: 0, //the number of instances of switcher
		current: '', //the 'current' theme name
		resetTo: '', //the theme name to reset back to
		bcls: '', // the body's original uithemeswitcher-theme-* class, eg. 'uithemeswitcher-theme-dot-luv'
		destroy: function(){
			// does NOT remove body class; does NOT remove inserted themes
			var remove = $('.uithemeswitch-content, .uithemeswitch-header', this).hide();
			$(this).accordion('destroy').removeClass('uithemeswitch').removeData('uithemeswitch');
			remove.remove();
			$.uithemeswitch.instCt--;
		},
		init: function(settings){
			var self = $(this),
					ns = $.uithemeswitch,
					options = $.extend({}, ns.options, settings),
					compact = !!options.compact,
					keepLoaded = parseInt(options.keep, 10),
					cssCDN = ns.cssCDN.replace(/\{uiVersion\}/g, options.uiVersion),
					thumbCDN = ns.thumbCDN.replace(/\{thumbsize\}/g, compact ? '30' : '90'),
					allThemes = {},
					name = {},
					cookieObject = (function(){
						var rtn = {}, name, m;
						for(name in options){
							m = name.match(/^cookie(\w+)$/);
							if(m){
								rtn[ m[1].toLowerCase() ] = options[name];
							}
						}
						return rtn;
					}()),
					canRemember = $.isFunction(options.cookie) 
						? options.cookie
						: ( !options.cookie || !cookieObject.name || !$.cookie
							? 0
							: function(cookieObject, themeName){
									// this a wrapper for calling $.cookie ($.cookie has no use for the 3rd argument, themeObject)
									return arguments.length > 1
										//setter...
										? $.cookie(cookieObject.name, themeName || null, cookieObject)
										//getter...
										: $.cookie(cookieObject.name, cookieObject);
								}
							),
					fromMemory = !canRemember ? '' : canRemember(cookieObject) || '',
					// a cookie-loaded theme takes precedence over the loadTheme option...
					loadTheme = fromMemory || options.loadTheme || '',
					preload = 0,
					codedTheme = '',
					remembering = !!canRemember && options.forceRemember !== false && 
						(options.forceRemember === true || !!fromMemory || !options.showRemember),
					header = $('<div><a href="#"></a></div>'),
					temp = 0,
					content,

					// simply prefixes a string with 'uithemeswitch', optionally preceded by a '.'...
					uts = function(x, dot){
						return (dot ? '.' : '') + 'uithemeswitch' + (x || '');
					},
					// force an 'instant' close of the accordion's open content pane...
					closeAccordion = function(){
						$(uts('', 1)).each(function(){
							var uiAccordion = $(this),
									data = uiAccordion.data(uts()),
									accordionAnim = uiAccordion.accordion('option', 'animated');
							if(data.options.closeSelect){
								$(uts('-ul', 1), uiAccordion.accordion('option', 'animated', false)).get(0).scrollTop = 0;
								uiAccordion.accordion('activate', false).accordion('option', 'animated', accordionAnim);
							}
						});
					},
					cookieSet = function(themeName, themeObject){
						if(!!canRemember){
							canRemember(cookieObject, remembering && themeName ? themeName : null, themeObject);
						}
					},
					// sets body class, header(s) and cookie...
					displaySaveTheme = function(themeName, themeObject){
						var b = $('body').get(0),
								switchers = $(uts('', 1)),
								cls;
						if(b){
							cls = $.grep($.trim(b.className || '').split(/\s+/), function(v){
									return !(/^uithemeswitch-theme-/).test(v);
								});
							if(themeName){
								cls.push(uts('-theme-') + themeObject.cls);
							}else if(ns.bcls){
								cls.push(ns.bcls);
							}
							b.className = cls.join(' ');
						}
						// handles multiple instances of uithemeswitch...
						$(uts('-current-theme', 1)).text(themeName);
						$('.ui-state-active', switchers.toggleClass(uts('-themed'), !!themeName)).removeClass('ui-state-active');
						if(themeName){
							$(uts('-select-' + themeObject.cls, 1) + '>div', switchers).addClass('ui-state-active');
						}
						cookieSet(themeName, themeObject);
					},
					// return true if event type is mouseleave or mouseout...
					eventCursorOff = function(ev){
						return (/^mouse(leave|out)$/).test(ev.type);
					},
					// changes theme selector background colour on hover (scope is LI)...
					hoverTheme = function(ev){
						$(this).children().toggleClass('ui-state-hover', !eventCursorOff(ev));
					},
					// implements the new theme stylesheet...
					implementCSS = function(fromTheme, keepLoaded){
						var links = $('head link'),
								loaded = links.filter('.ui-theme'),
								remove = loaded.filter(function(){ return this.href.indexOf(fromTheme.folder) >= 0; }),
								cssLink, after;
						if(remove.length){
							// we already have the required theme linked in, so rather than link it in again,
							// just remove the subsequently loaded themes that are no longer required...
							loaded = loaded.slice(loaded.index(remove) + 1).remove();
						}else{
							cssLink = $('<link href="' + fromTheme.css + '" type="text/css" rel="stylesheet" class="ui-theme ui-switcher" />');
							after = loaded.length ? loaded.last() : links.not(loaded).filter('[href$="jquery-ui.css"]').last();
							if(after.length){
								after.after(cssLink);
							}else{
								// fallback for when we can't find anything that looks like a theme stylesheet...
								$('head').append(cssLink);
							}
						}
						// let's try not to have too many unnecessary stylesheets linked in at once...
						// (but only remove those that the switcher has added!)
						loaded.filter('.ui-switcher').slice(0, -keepLoaded).remove();
						links = loaded = remove = after = null;
					},
					// handles a click on a switcher (scope is UL.uithemeswitch-ul)...
					switcherClick = function(ev, init){
						var target = $(ev.target),
								selectedData = target.closest('li').data(uts()),
								themeName = selectedData.theme,
								switcherData = target.closest(uts('', 1)).data(uts()),
								options = switcherData.options,
								fromTheme = switcherData.themes,
								rtn = false;
						// note that re-selecting the current theme is ignored unless initialising; also, returning false from
						// the onSelect() option will prevent the selected theme being implemented; and neither onSelect() or
						// onload() are run if initialising
						if(themeName){
							fromTheme = fromTheme[themeName];
							if(fromTheme
									&& (init || (themeName !== ns.current && options.onSelect(themeName, ns.current, remembering) !== false))){
								implementCSS(fromTheme, options.keep);
								displaySaveTheme(themeName, fromTheme);
								closeAccordion();
								if(!init){
									options.onLoad(themeName, ns.current);
								}
								ns.current = themeName;
							}
						// reset; note that onSelect() & onLoad() are NOT called...
						}else if(selectedData.reset && options.onReset(ns.current, ns.resetTo, remembering) !== false){
							$('head link.ui-switcher').remove();
							displaySaveTheme( ns.resetTo, fromTheme[ns.resetTo] || {} );
							closeAccordion();
							ns.current = ns.resetTo;
						// remember...
						}else if(selectedData.remember){
							rtn = options.onRemember(remembering);
							if(rtn !== false){
								// if the checkbox itself was clicked we must return true; otherwise, return false...
								rtn = target.is('input');
								// handles multiple instances of uithemeswitch...
								$(uts('-remember-check', 1)).not(target).each(function(){
										this.checked = !this.checked;
									});
								remembering = !remembering;
								cookieSet(ns.current, fromTheme[ns.current] || {});
							}
						}
						return rtn;
					},
					// sort the themes alphabetically by name...
					sortThemes = function(){
						var a = [],
								b = 0,
								c = {},
								d;
						for(d in allThemes){ a[b++] = d; }
						a.sort();
						for(d = 0 ; d < b; d++){ c[ a[d] ] = allThemes[ a[d] ]; }
						a = null;
						return c;
					};

			$.each(ns.themes, function(k, v){
				var cls = k.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
						folder, thumb, cdn;
				if(v && !name[cls]){
					cdn = v.cdn !== false;
					folder = cdn ? v.folder || k.toLowerCase().replace(/\s+/g, '-') : v.folder;
					thumb = cdn ? v.thumb || folder.replace(/-/g, '_') : v.thumb;
					if(folder && thumb){
						++temp;
						name[cls] = k;
						allThemes[k] = {
							folder: folder,
							css: cdn ? cssCDN.replace(/\{folder\}/g, folder) : folder,
							thumb: 'url(' + (cdn ? thumbCDN.replace(/\{thumb\}/g, thumb) : thumb) + ')',
							cls: cls,
							cdn: cdn
							};
						preload = preload || k === loadTheme;
					}
				}
			});

			if(temp){
				// good to go...

				if(options.sorted){
					allThemes = sortThemes();
				}
				options.keep = isNaN(keepLoaded) || keepLoaded < 1 ? 1 : keepLoaded;

				// determine initial theme...
				if(ns.instCt++){
					// this would only be set if this is not the first instance on this page
					codedTheme = ns.current;
				}else{
					// first instance...
					// if there's already a linked-in theme, that we can recognise, find it in our list of themes...
					$('head link').filter(function(){
						var name, match;
						for(name in allThemes){
							match = this.href.indexOf(allThemes[name].folder) >= 0;
							if(match){
								codedTheme = name;
								break;
							}
						}
						return match;
					}).addClass('ui-theme');
					ns.resetTo = codedTheme;
					// check current body class (for reset purposes)...
					temp = $('body').get(0);
					temp = temp ? (' ' + (temp.className || '') + ' ').match(/\s(uithemeswitch-theme-[^\s]+)\s/) : temp;
					if(temp){
						ns.bcls = temp[1];
					}
				}

				// content panel list...
				content = $('<ul/>')
					.css({listStyleType: 'none', overflow: 'auto', overflowX: 'hidden'})
					.addClass(uts('-ul ui-corner-bottom'))
					.click(switcherClick)
					.append(
						// remember...
						//   note : there's no point showing it unless there's the means available for remembering
						$('<li></li>').data(uts(), {remember:1})[options.showRemember && !!canRemember ? 'show' : 'hide']().append(
							$('<div/>').addClass(uts('-remember')).text(options.textRemember)
								.append(
									$('<input type="checkbox" value="1" /></div>').addClass(uts('-remember-check'))
										.each(function(){ this.checked = remembering; })
								)
						),
						// reset...
						$('<li></li>').data(uts(), {reset:1})[options.showReset ? 'show' : 'hide']().append(
							$('<div/>').text(options.textReset).addClass(uts('-reset'))
						)
					);
				// themes...
				for(name in allThemes){
					content.append(
						$('<li></li>').data(uts(), {theme:name}).addClass(uts('-select-' + allThemes[name].cls)).append(
							$('<div/>').append(
								$('<div/>').css({backgroundImage:allThemes[name].thumb})
									.addClass(uts('-theme') + (compact ? '-compact' : ''))
									.text(name)
								)
							)
						);
				}
				$('li', content).addClass(uts('-li ui-corner-bottom')).hover(hoverTheme)
					.children().addClass(uts('-wrap ui-widget-content ui-corner-all'));

				content = $('<div/>').append(content).hide();

				// 'all' is the entire switcher, whereas 'list' does not include accordion header...
				temp = {all:self, list:content}[options.closeMouseout];
				if(temp){
					temp.mouseleave(function(){
						// closes accordion on mouseleave...
						$(this).closest(uts('', 1)).accordion('activate', false);
						return false;
					});
				}

				// header...			
				temp = $('a', header).addClass(uts('-button')).append( 
						$('<span/>').addClass(uts('-prompt')).text(options.textPrompt),
						$('<span/>').addClass(uts('-current')).text(options.textCurrent)
							.append( $('<span/>').addClass(uts('-current-theme')) )
					);
				if(options.themeRollover){
					temp.addClass(uts('-rollover'))
						.hover(function(ev){
							// remove anchor's rollover class on enter, add class on leave...
							$(this).toggleClass(uts('-rollover'), eventCursorOff(ev));
						});
				}

				self.addClass(uts())
					.data(uts(), {
						options: options,
						themes: allThemes
					})
					// append header & content...
					.append( header.addClass(uts('-header')), content.addClass(uts('-content')) )
					// create accordion...
					.accordion({active:false, collapsible:true});

				// if an initial theme load is required, do it...
				if(preload || codedTheme){
					$(uts('-select-' + allThemes[preload ? loadTheme : codedTheme].cls, 1), self).trigger('click', [true]);
				}

			}
		} // end init()
	};

	$.fn.uithemeswitch = function(options, themeName){
		if($.fn.accordion){
			this.each(function(){
				var ns = $.uithemeswitch,
						isSwitcher = $(this).hasClass('uithemeswitch'),
						data;
				if(options === 'destroy' && isSwitcher){
					ns[options].call(this);
				}else if(options === 'reset' && isSwitcher){
					$('.uithemeswitch-reset', this).trigger('click');
				}else if(options === 'select' && !!themeName){
					$('.uithemeswitch-content li:[data-uitheme="' + themeName + '"]', this).trigger('click');
				}else if(!isSwitcher){
					//look for data-uts={options object} and/or data-uts-[option name]=value
					//priority : data-uts-[option name] values > data-uts object > passed-in options object
					//note : option name is the non-camelBacked version (ie. for maxHeight option, use data-uts-max-height)
					data = $(this).data() || {};
					data.uts = data.uts || {};
					$.each(data, function(k, v){
						if(/^uts([A-Z][a-z]+)+$/.test(k)){ //jQuery 1.6+
							data.uts[ k.substr(3,1).toLowerCase() + k.substr(4) ] = v;
						}else if(/^uts(-[a-z]+)+$/.test(k)){ //jQuery 1.4.3 -> 1.5*
							k = $.map(k.split('-'), function(x, i){
								return i ? (i > 1 ? x.substr(0,1).toUpperCase() + x.substr(1) : x) : null;
							}).join('');
							data.uts[k] = v;
						}
					});
					ns.init.call(this, $.extend({}, options || {}, data.uts));
				}
			});
		}
		return this;
	};
	
}

}(jQuery));
