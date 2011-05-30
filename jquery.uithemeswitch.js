/** @preserve jquery.uithemeswitch.js
 * requires jquery.ui.accordion.js, and optionally jquery.cookie.js
 */
/*global jQuery, document, window */
/*jslint white:false, regexp:false, plusplus:false, strict:false, forin:true*/

/* Theme Switcher for jQuery UI
 * 
 * IMPORTANT : to use cookies, you need to include Klaus Hartl's cookie plugin for jQuery...
 *             https://github.com/carhartl/jquery-cookie
 * 
 * - switcher is made into an accordion and styled according to page's current theme (no accordion, no switcher!)
 * - places theme stylesheets immediately after each other, allowing site stylesheets to supercede and override all themes
 * - handles recognised theme links coded into the page (as well as a loadTheme option)
 * - uses data-uithemeswitch='{options object}' attribute if set on target element (overrides options passed into $.fn.uithemeswitch())
 * - handles multiple theme switcher instances on a page (can't see why multiples would be needed, but ...)
 * - can have small or large (the default) theme thumbnails (compact option)
 * - can intercept and prevent a switch (onSelect option)
 * - can set all cookie options
 * - can use external cookie(?) function for saving selected theme
 * - UI version can be changed from options
 * - can provide post-switch processing (onLoad option)
 * - class on BODY indicates current theme ('uithemeswitch-theme-' + THEME, where THEME is the CDN css folder
 *     unless cdn isn't being used in which case its the theme name lowercased with spaces replaced by hyphens
 *     eg 'uithemeswitch-theme-south-street', or 'uithemeswitch-theme-my-custom-theme')
 * - themes and thumbnails are sourced from CDN (but don't have to be)
 * - theme list can be modified, even adding your own
 * - optional 'Reset Theme' and 'Remember' options (with 'on___()' callback options)
 * - options can be preset ($.uithemeswitch.options.___ = ... )
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
 *     <link type='text/css' rel='stylesheet' href='http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.12/themes/base/jquery-ui.css' />
 *     <script type='text/javascript' src='http://code.jquery.com/jquery-1.6.1.min.js'></script>
 *     
 *     <!-- you need ui-accordion and its dependencies... -->
 *     <script type='text/javascript' src='http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.12/jquery-ui.min.js'></script>
 *     <script type='text/javascript' src='jquery.uithemeswitch-1.0.js'></script>
 *     <!-- if you want to use cookies to save the selected theme... -->
 *     <script type='text/javascript' src='jquery.cookie.js'></script>
 *     
 *     <script type='text/javascript'>
 *     jQuery(document).ready(function($){
 *       $('#myThemeSwitcher').uithemeswitch();
 *       $('.myThemeSwitchers').uithemeswitch({sorted:false});
 *     });
 *     </script>
 *     
 *     <style type='text/css'>
 *       #myThemeSwitcher { position: absolute; top: 10px; left: 10px; width: 15em; }
 *       .myThemeSwitchers { float: left; width: 15em; margin: 50px 30px 0 0; }
 *       body.uithemeswitch-theme-darkhive { font-size: 0.8em; }
 *     </style>
 *   </head>
 *   <body>
 *   
 *     <div id='myThemeSwitcher'></div>
 *     
 *     <div class='myThemeSwitchers' data-uithemeswitch='{"maxHeight":300,"closeMouseout":"widget"}'></div>
 *     <div class='myThemeSwitchers' data-uithemeswitch='{"compact":true}'></div>
 *   
 *   <!-- to preload a theme in the absence of a cookie-saved theme...
 *     <div class='myThemeSwitchers' data-uithemeswitch='{"loadTheme":"Dark Hive"}'></div>
 *   -->
 *   
 *   </body>
 *   </html>
 *
 * Where and how you place it, and how you control its width, is completely up to you
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
		version: '1.0', // 30 May 2011
		options: {
			uiVersion: '1.8.13', // (latest at the time of writing) this is for the theme css, and should match the UI version you are using
			compact: 0, // set true for small thumbnail; small = 30x27 px, large (default) = 90x80 px
			loadTheme: null, // set to a theme name (eg. 'UI Lightness') to initially load that theme (in the absence of a cookie-saved theme)
			text: {
				prompt: 'Switch Theme',    // text displayed when current theme isn't (or can't be) displayed
				current: 'Theme: ',        // text preceding the current theme's name
				reset: 'Reset Theme',      // text on the reset option
				remember: 'Remember'       // text on the remember option (in front of the remember checkbox)
				},
			width: null, // set your own, or get this to set it (using .css(), not .width()); I suggest '15em', or '150px'/'160px'
			maxHeight: 200, // maximum height of the scrollable list of themes (the accordion panel)
			closeSelect: 1, // collapses the list on selection of a new theme
			closeMouseout: 'panel', // collapses the list on mouseout/leave of either the 'panel' (content only) or the 'widget' (header + content), or neither if false(ish)
			cookie: { // set false/null to not use cookies, or set to a function to use your own [function is a setter only, and takes 2 params : theme name, and theme object]
				name: 'jquery-ui-theme', // String
				expires: null, // null (for end of session), a Date, or a number of days (negative deletes cookie)
				path: '', // String folder (eg. '/' or '/sub-folder/') ... defaults to page's current path
				domain: '', // String (eg. 'www.domain.com') ... defaults to page's current domain
				secure: window.location.protocol === 'https:' // Boolean, true if secure
				},
			showRemember: 0, // show the remember button (at top of list of themes)
			rememberedTheme: '', // theme name, only required if using an external function for 'cookie' and you need to indicate that a pre-linked theme originated from a cookie (ie. because you have showRemember set)
			forceRemember: null, // set true or false to override the default setting of the remember checkbox
			keep: 2, // maximum number of historic themes to keep loaded
			sorted: 1, // sort the themes alphabetically
			showReset: 0, // show the reset button (above list of themes)
			themeRollover: 1, // only show the theme in the button text on mouse rollover (of the button)
			onLoad: $.noop, // function, called after selected theme has been requested; parameters : new theme, previous theme; NOT called on initial load (via either cookie or loadTheme option)
			onRemember: $.noop, // function, called when Remember is clicked; parameters : current state of Remember; return false to prevent the change of state
			onReset: $.noop, // function, called when Reset Theme is clicked; parameters : current theme, reset theme, current state of Remember; return false to prevent any action being taken
			onSelect: $.noop // function, called when a new theme is selected; parameters : selected theme, current theme, current state of Remember; return false to prevent selection
		},
		cssCDN: 'http://ajax.googleapis.com/ajax/libs/jqueryui/{uiVersion}/themes/{folder}/jquery-ui.css',
		thumbCDN: 'http://static.jquery.com/ui/themeroller/images/themeGallery/theme_{thumbsize_30_90}_{thumb}.png',
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
		currentTheme: '',
		resetTheme: '',
		destroy: function(){
			// does NOT remove body class; does NOT remove inserted themes
			var remove = $('.uithemeswitch-content, .uithemeswitch-header', this).hide();
			$(this).accordion('destroy').removeClass('uithemeswitch');
			remove.remove();
		},
		init: function(settings){
			var self = $(this),
					ns = $.uithemeswitch,
					options = $.extend(true, {}, ns.options, settings),
					smallThumb = !!options.compact,
					cssCDN = ns.cssCDN.replace(/\{uiVersion\}/g, options.uiVersion),
					thumbCDN = ns.thumbCDN.replace(/\{thumbsize_30_90\}/g, smallThumb ? '30' : '90'),
					allThemes = $.extend(true, {}, ns.themes),
					canRemember = $.isFunction(options.cookie) ? 2 : ( !!options.cookie && !!options.cookie.name && !!$.cookie ? 1 : 0 ),
					fromMemory = canRemember === 1 ? $.cookie(options.cookie.name) : ( canRemember ? options.rememberedTheme || '' : '' ),
					// a cookie-loaded theme takes precedence over the loadTheme option...
					loadTheme = fromMemory || options.loadTheme || '',
					preload = 0,
					codedTheme = null,
					switcherpane = '',
					remember = canRemember && options.forceRemember !== false && 
						(options.forceRemember === true || !!fromMemory || !options.showRemember),
					button = $('<div><a href="#">' + options.text.prompt + '</a></div>'),

					// force an 'instant' close of the accordion's open content pane...
					closeAccordion = function(){
						if(options.closeSelect && switcherpane.is(':visible')){
							var accordionAnim = self.accordion('option', 'animated');
							self.accordion('option', 'animated', false);
							$('ul', switcherpane).get(0).scrollTop = 0;
							button.trigger('click').blur();
							self.accordion('option', 'animated', accordionAnim);
						}
					},
					cookieSet = function(themeName){
						if(!remember){
							themeName = false;
						}
						if(canRemember === 2){
							// external...
							options.cookie(themeName, allThemes[themeName] || {});
						}else if(canRemember){
							// cookie...
							$.cookie(options.cookie.name, themeName || null, options.cookie);
						}
					},
					// sets body class, button(s) and cookie...
					displaySaveTheme = function(themeName){
						var b = $('body').get(0),
								cls;
						if(b){
							cls = $.grep((b.className || '').split(/\s+/), function(v){
									return (v && !(/^uithemeswitch-theme-/).test(v));
								});
							if(!themeName){
								if(ns.resetTheme){
									cls.push(ns.resetTheme);
								}
							}else{
								cls.push('uithemeswitch-theme-' + allThemes[themeName].bodycls);
							}
							b.className = cls.join(' ');
						}
						// handles multiple instances of uithemeswitch...
						$('.uithemeswitch-header a:not(.uithemeswitch-rollover)')
							.text( themeName ? options.text.current + themeName : options.text.prompt );
						cookieSet(themeName);
					},
					// return true if event type is mouseleave or mouseout...
					eventTypeLeaveOut = function(ev){
						return (/^mouse(leave|out)$/).test(ev.type);
					},
					// return full href path to stylesheet...
					getStylesheetHref = function(themeName){
						return ( allThemes[themeName].cdn === false 
							? allThemes[themeName].folder 
							: cssCDN.replace(/\{.*?\}/g, allThemes[themeName].folder) );
					},
					hoverButton = function(ev){
							if(ns.currentTheme){
								$(this).text( eventTypeLeaveOut(ev) ? options.text.prompt : options.text.current + ns.currentTheme );
							}
					},
					// hides pane on mouseout/leave...
					hoverClose = function(ev){
						if(eventTypeLeaveOut(ev) && switcherpane.is(':visible')){
							button.trigger('click').blur();
						}
						return false;
					},
					// changes theme selector background colour on hover...
					hoverTheme = function(ev){
						$('>div', this).toggleClass('ui-state-hover', !eventTypeLeaveOut(ev));
					},
					// implements the new theme stylesheet...
					implementCSS = function(themeName){
						var cssHref = getStylesheetHref(themeName),
								links = $('head link'),
								loaded = links.filter('.ui-theme'),
								remove = loaded.filter('[href="' + cssHref + '"]'),
								cssLink, after;
						if(remove.length){
							// we already have the required theme linked in, so rather than link it in again,
							// just remove the subsequently loaded themes that are no longer required...
							loaded.slice(loaded.index(remove) + 1).remove();
							loaded = [];
						}else{
							cssLink = $('<link href="' + cssHref + '" type="text/css" rel="stylesheet" class="ui-theme ui-switcher" />');
							after = loaded.length ? loaded.last() : links.not(loaded).filter('[href$="jquery-ui.css"]').last();
							if(after.length){
								after.after(cssLink);
							}else{
								// fallback for when we can't find anything that looks like a theme stylesheet...
								$('head').append(cssLink);
							}
						}
						displaySaveTheme(themeName);
						if(loaded.length >= options.keep){
							// let's try not to have too many unnecessary stylesheets linked in at once...
							loaded.first().remove();
						}
						links = loaded = remove = after = null;
					},
					// if there's already a linked-in theme, find it in our list of themes...
					linkedInTheme = function(){
						var rtn = null;
						$('head link').filter('[href$="jquery-ui.css"]').each(function(){
							var name;
							for(name in allThemes){
								if(getStylesheetHref(name) === this.href){
									rtn = name;
								}
							}
						});
						return rtn;
					},
					// remember clicked...
					rememberTheme = function(el){
						// if the checkbox itself was clicked we must return true; otherwise, return false...
						var rtn = $(el).is('input');
						// handles multiple instances of uithemeswitch...
						$('.uithemeswitch-remember input').not(el).each(function(){
								this.checked = !this.checked;
							});
						remember = !remember;
						cookieSet(ns.currentTheme);
						return rtn;
					},
					// resets
					resetTheme = function(){
						$('head link.ui-switcher').remove();
						$('body').each(function(){
							var resetTo = ns.resetTheme || '',
									cls = $.grep((this.className || '').split(/\s+/), function(v){
										return (!!v && ( v === resetTo || !(/^uithemeswitch-theme-/).test(v) ));
									});
							if(resetTo){
								cls.push(resetTo);
							}
							this.className = cls.join(' ');
						});
						displaySaveTheme( linkedInTheme() );
						closeAccordion();
						ns.currentTheme = '';
					},
					// handles a click on a theme...
					selectTheme = function(ev){
						var target = $(ev.target),
								item = target.closest('li'),
								themeName = item.data('uitheme') || '',
								rtn = false;
						// note that re-selecting the current theme is ignored; also, returning false from
						// the onSelect() option will prevent the selected theme being implemented;
						// note that onSelect is not called for a reset
						if(themeName && allThemes[themeName] && themeName !== ns.currentTheme &&
								options.onSelect(themeName, ns.currentTheme, remember) !== false){
							implementCSS(themeName);
							closeAccordion();
							options.onLoad(themeName, ns.currentTheme);
							ns.currentTheme = themeName;
						}else if(item.hasClass('uithemeswitch-reset') && options.onReset(ns.currentTheme, ns.resetTheme, remember) !== false){
							resetTheme();
						}else if(item.hasClass('uithemeswitch-remember')){
							rtn = options.onRemember(remember) !== false ? rememberTheme(ev.target) : false;
						}
						return rtn;
					},
					// sort the themes alphabetically by name...
					sortThemes = function(){
						var a = [],
								b = 0,
								c = {},
								name;
						for(name in allThemes){ a[b++] = name; }
						a.sort();
						for(b = 0 ; b < a.length; b++){ c[a[b]] = allThemes[a[b]]; }
						a = null;
						return c;
					};

			if(options.sorted){
				allThemes = sortThemes();
			}

			if(options.keep < 1){
				options.keep = 1;
			}

			// panel markup...
			switcherpane += '<li class="uithemeswitch-remember"><div>' + options.text.remember + '<input type="checkbox" value="1" /></div></li>';
			switcherpane += '<li class="uithemeswitch-reset"><div>' + options.text.reset + '</div></li>';
			$.each(allThemes, function(k, v){
				var backgroundImage;
				if(v){
					if(v.cdn === false){
						// custom user-defined themes...
						v.bodycls = k.toLowerCase().replace(/\s+/g, '-');
						backgroundImage = v.thumb;
					}else{
						v.folder = v.folder || k.toLowerCase().replace(/\s+/g, '-');
						v.thumb = v.thumb || v.folder.replace(/-/g, '_');
						v.bodycls = v.folder;
						backgroundImage = thumbCDN.replace(/\{.*?\}/g, v.thumb);
					}
					if(v.folder && v.thumb){
						switcherpane += [
							'<li data-uitheme="', // [theme name],
							'"><div style="background-image:url(' + backgroundImage + ');">', // [theme name],
							'</div></li>'
							].join(k);
						if(k === loadTheme){
							preload = 1;
						}
					}
				}
			});
			switcherpane = $('<div><ul>' + switcherpane + '</ul></div>');

			// determine initial theme...
			if(ns.currentTheme){
				// this would (should) only be set if this is not the first instance on this page
				codedTheme = ns.currentTheme;
			}else{
				codedTheme = linkedInTheme();
				// check current body class (for reset purposes)...
				$('body').each(function(){
						var cls = this.className || '';
						if(cls){
							cls = (' ' + cls + ' ').match(/\s(uithemeswitch-theme-[^ ]+)\s/);
						}
						if(cls){
							ns.resetTheme = cls[1];
						}
				});
			}

			// pane CSS and events...
			switcherpane.css({
					padding: '0'
				});
			if(options.closeMouseout === 'panel'){
				// this is only on the panel, and does not include the button (accordion header)
				switcherpane.hover(hoverClose);
			}else if(options.closeMouseout === 'widget'){
				// this is on the entire switcher (accordion widget)
				self.hover(hoverClose);
			}
				
			$('ul', switcherpane).css({
					listStyleType: 'none',
					margin: 0,
					padding: 0,
					overflow: 'auto',
					overflowX: 'hidden',
					maxHeight: options.maxHeight,
					width: '100%',
					cursor: 'pointer'
				})
				.addClass('ui-corner-bottom')
				.click(selectTheme);
			$('li', switcherpane).css({
					width: '100%',
					padding: '0.1em 0',
					margin: 0,
					display: 'block',
					overflow: 'hidden'
				})
				.hover(hoverTheme)
				.find('div').css({
					backgroundPosition: smallThumb ? '6px 0' : '50% 95%',
					backgroundRepeat: 'no-repeat',
					textAlign: smallThumb ? 'left' : 'center',
					fontWeight: 'normal',
					padding: smallThumb ? '0.5em 0 0.5em 42px' : '0 0 82px 0',
					margin: smallThumb ? '0 2px 0 2px' : '0 1px 0 2px'
				})
				.addClass('ui-widget-content ui-corner-all');
			$('li.uithemeswitch-reset div', switcherpane).css({
					backgroundImage: 'none',
					padding: '2px 0 2px 10px',
					textAlign: 'left',
					fontWeight: 'bold'
				})
				.parent()[options.showReset ? 'show' : 'hide']();
			$('li.uithemeswitch-remember div', switcherpane).css({
					backgroundImage: 'none',
					padding: '2px 0 2px 10px',
					textAlign: 'left',
					fontWeight: 'bold'
				})
				.find('input').each(function(){
						this.checked = remember;
					}).css({
						marginLeft: '2em',
						verticalAlign:'bottom',
						cursor:'pointer'
					}).end()
				// there's no point showing 'Remember' unless there's also a mechanism available for remembering...
				.parent()[canRemember && options.showRemember ? 'show' : 'hide']();

			// target...
			if(options.width){
				self.css({width:options.width});
			}

			if(options.themeRollover){
				$('a', button).addClass('uithemeswitch-rollover').hover(hoverButton);
			}

			self.addClass('uithemeswitch')
				// append button & pane...
				.append(button.addClass('uithemeswitch-header'))
				.append(switcherpane.addClass('uithemeswitch-content').hide())
				// create accordion...
				.accordion({active:false, collapsible:true});

			if(codedTheme){
				displaySaveTheme(codedTheme);
			}
			// if an initial theme load is required, do it...
			if(preload){
				implementCSS(loadTheme);
				ns.currentTheme = loadTheme;
			}else{
				ns.currentTheme = codedTheme || '';
			}

		}
	};

	$.fn.uithemeswitch = function(options, themeName){
		if($.fn.accordion){
			this.each(function(){
				var ns = $.uithemeswitch,
						isSwitcher = $(this).hasClass('uithemeswitch'),
						data = $(this).data('uithemeswitch');
				if(options === 'destroy' && isSwitcher){
					ns[options].call(this);
				}else if(options === 'reset' && isSwitcher){
					$('.uithemeswitch-reset', this).trigger('click');
				}else if(options === 'select' && !!themeName){
					$('.uithemeswitch-content li:[data-uitheme="' + themeName + '"]').trigger('click');
				}else if(!isSwitcher){
					ns.init.call(this, $.extend({}, options || {}, $.isPlainObject(data) ? data : {}));
				}
			});
		}
		return this;
	};
	
}

}(jQuery));
