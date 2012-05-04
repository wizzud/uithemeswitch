# Theme Switcher for jQuery UI

---

Theme Switch is a jQuery plugin for use with jQuery UI, and allows switching between UI Themes. (Please note that it is *not* a UI widget!)

- switcher is made into an accordion and styled according to page's current theme (no accordion, no switcher!)
- places theme stylesheets immediately after each other, allowing site stylesheets to supercede and override all themes
- handles recognised theme links coded into the page (as well as a loadTheme option)
- uses data-uts='{options object}' attribute, and data-uts-[option name]=value attributes if set on target element
- handles multiple theme switcher instances on a page
- can have small or large (the default) theme thumbnails (compact option)
- can intercept and prevent a switch (onSelect option)
- can set all cookie options
- can use external cookie(?) function for saving selected theme (see note at bottom)
- UI version defaults to jQuery.ui.version, but can be changed from options. Note: if your page loads a 'latest' version (eg. .../jqueryui/1/...) you should set this option to '1' also!
- can provide post-switch processing (onLoad option)
- class on BODY indicates current theme ('uithemeswitch-theme-' + THEME, where THEME is the theme name lowercased, with anything non-alnumeric replaced by hyphens, eg 'uithemeswitch-theme-south-st', or 'uithemeswitch-theme-my-custom-theme')
- themes and thumbnails are sourced from CDN (but don't have to be)
- theme list can be modified, even adding your own
- optional 'Reset Theme' and 'Remember' options (with 'on___()' callback options)
- options can be preset (eg. `$.uithemeswitch.options.loadTheme = 'Black Tie';` )

## Usage :

    $(__).uithemeswitch(options, themeName);

where *options* is optional and one of:

- an object of option settings (see below) : creates the theme switcher on the selected element(s)
- a string, "__destroy__" : destroys the selected theme switcher(s) previously created (without resetting styles!)
- a string, "__reset__" : removes styles loaded by themeswitcher, and removes cookie
- a string, "__select__", and a themeName (eg. *"UI Lightness"*) : selects the theme if available

Obviously, your page needs to include jQuery and jQuery UI. It also needs:

- UI Accordion, or Theme Switch simply won't run
- recommended : a jQuery UI stylesheet to use as a base or default
- the Theme Switch css file, or use your own styling if you prefer (but please refer to the css supplied).  
__*NOTE*__ : the Theme Switch css should be included __after__ the jQuery UI stylesheet!
- the Theme Switch code, in either full or minified form

### Sample : 

	<!DOCTYPE html>
	<html>
	<head>
		<link type='text/css' rel='stylesheet' 
			href='//ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/themes/base/jquery-ui.css' />
		
		<!-- you need the uithemeswitch stylesheet, AFTER the jquery UI stylesheet(s)... -->
		<link type='text/css' rel='stylesheet' href='jquery.uithemeswitch.css' />
		
		<!-- you need jQuery, plus ui-accordion and its dependencies... -->
		<script type='text/javascript' src='http://code.jquery.com/jquery-1.7.2.min.js'></script>
		<script type='text/javascript'
			src='//ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min.js'></script>
		
		<!-- you need the uithemeswitch code... -->
		<script type='text/javascript' src='jquery.uithemeswitch.min.js'></script>
		<!-- if you want to use cookies to save the selected theme... -->
		<script type='text/javascript' src='jquery.cookie.js'></script>
		
		<script type='text/javascript'>
		jQuery(function($){
			$('#myThemeSwitcher').uithemeswitch();
		});
		</script>
		<style type='text/css'>
 		#myThemeSwitcher { position: absolute; top: 10px; left: 10px; width: 15em; }
		body.uithemeswitch-theme-dot-luv .ui-widget { font-size: 1.1em; } /*reduce from 1.3em*/
		</style>
	</head>
	<body>
		<div id='myThemeSwitcher'></div>
	
		<!-- to preload a theme in the absence of a cookie-saved theme...
		<div id='myThemeSwitcher' data-uts-load-theme='Dark Hive'></div>
		-->
		
	</body>
	</html>

Where and how you place the Theme Switcher is completely up to you.

## Options

<style type="text/css">table{border-collapse:collapse;}td,th{vertical-align:top;border:1px solid #cccccc;padding:2px 5px;}th{background-color:#666666;color:#ffffff;font-weight:normal;text-align:left;}</style>
<table>
	<tr>
		<th>Option</th>
		<th>Default</th>
		<th>Decsription</th>
	</tr>
	<tr>
		<td>uiVersion</td>
		<td>$.ui.version</td>
		<td>picked up from loaded ui, but overridable in case a 'latest' url is used for css (eg. like .../jqueryui/1/...)</td>
	</tr>
	<tr>
		<td>compact</td>
		<td>0</td>
		<td>set true for small thumbnail; small = 30x27 px, large (default) = 90x80 px</td>
	</tr>
	<tr>
		<td>loadTheme</td>
		<td>''</td>
		<td>set to a theme name (eg. 'UI Lightness') to initially load that theme (in the absence of a cookie-saved theme)</td>
	</tr>
	<tr>
		<td>textPrompt</td>
		<td>'Switch Theme'</td>
		<td>text displayed when current theme isn't (or can't be) displayed</td>
	</tr>
	<tr>
		<td>textCurrent</td>
		<td>'Theme: '</td>
		<td>text preceding the current theme's name</td>
	</tr>
	<tr>
		<td>textReset</td>
		<td>'Reset Theme'</td>
		<td>text on the reset option</td>
	</tr>
	<tr>
		<td>textRemember</td>
		<td>'Remember'</td>
		<td>text on the remember option (in front of the remember checkbox)</td>
	</tr>
	<tr>
		<td>closeSelect</td>
		<td>1</td>
		<td>(instant) collapse of the list on selection of a new theme or a reset</td>
	</tr>
	<tr>
		<td>closeMouseout</td>
		<td>'all'</td>
		<td>collapses the list on mouseout of either the entire switcher (='all') of the content only (='list'); anything else prevents closure on mouseout (ie. re-click the header to close)</td>
	</tr>
	<tr>
		<td>cookie</td>
		<td>1</td>
		<td>
			default is to use $.cookie (Klaus Hartl) if found; set false(ish) to not use cookies, or set to a function 
			to use your own. When called as a 'getter', the function is given 1 argument :
			<ul>
				<li>cookie object, constructed from cookie* options, eg. { name:options.cookieName, expires:options.cookieExpires, etc }</li>
			</ul>
			When called as a 'setter', the function is given 3 arguments :
			<ul>
				<li>cookie object, constructed from cookie* options, eg. { name:options.cookieName, expires:options.cookieExpires, etc }</li>
				<li>current theme name (could be empty if there isn't one)</li>
				<li>current theme object, which contains information about the folder, thumbnail, cdn, etc</li>
			</ul>
		</td>
	</tr>
	<tr>
		<td>cookieName</td>
		<td>'jquery-ui-theme'</td>
		<td>String cookie name</td>
	</tr>
	<tr>
		<td>cookieExpires</td>
		<td>null</td>
		<td>null (for end of session), a Date, or a number of days (negative deletes cookie)</td>
	</tr>
	<tr>
		<td>cookiePath</td>
		<td>''</td>
		<td>String folder (eg. '/' or '/sub-folder/') ... $.cookie defaults it to page's current path</td>
	</tr>
	<tr>
		<td>cookieDomain</td>
		<td>''</td>
		<td>String (eg. 'www.domain.com') ... $.cookie defaults it to page's current domain</td>
	</tr>
	<tr>
		<td>cookieSecure</td>
		<td>window.location.protocol==='https:'</td>
		<td>Boolean, true if secure</td>
	</tr>
	<tr>
		<td>showRemember</td>
		<td>0</td>
		<td>show the remember item (at top of list of themes)</td>
	</tr>
	<tr>
		<td>forceRemember</td>
		<td>null</td>
		<td>set true or false to override the default setting of the remember checkbox</td>
	</tr>
	<tr>
		<td>keep</td>
		<td>2</td>
		<td>maximum number of historic themes to keep loaded</td>
	</tr>
	<tr>
		<td>sorted</td>
		<td>1</td>
		<td>sort the themes alphabetically</td>
	</tr>
	<tr>
		<td>showReset</td>
		<td>0</td>
		<td>show the reset button (above list of themes)</td>
	</tr>
	<tr>
		<td>themeRollover</td>
		<td>1</td>
		<td>only show the theme in the button text on mouse rollover (of the button)</td>
	</tr>
	<tr>
		<td>onLoad</td>
		<td>$.noop</td>
		<td>function, called after selected theme has been requested; parameters : new theme, previous theme; NOT called on initial load (via either cookie or loadTheme option)</td>
	</tr>
	<tr>
		<td>onRemember</td>
		<td>$.noop</td>
		<td>function, called when Remember is clicked; parameters : current state of Remember; return false to prevent the change of state</td>
	</tr>
	<tr>
		<td>onReset</td>
		<td>$.noop</td>
		<td>function, called when Reset Theme is clicked; parameters : current theme, reset theme, current state of Remember; return false to prevent any action being taken</td>
	</tr>
	<tr>
		<td>onSelect</td>
		<td>$.noop</td>
		<td>function, called when a new theme is selected; parameters : selected theme, current theme, current state of Remember; return false to prevent selection</td>
	</tr>
</table>

### NOTE re Cookies & 'remembering' Options :

As of 26 May 2011, UK law (from EU directive) basically requires that nothing be stored on the user's computer
without the user's permission (ie. cookies), and there is a 1 year grace period for websites to comply. However,
it is not an all-encompassing requirement, although the 'exceptions' can be a bit hard to determine : for example,
if you visit an online shop, and the shop stores a cookie on your PC that is purely used to facilitate storage
of basket contents and shop processing, etc, then that (it would seem) is okay, no permission is required. But if
the information gathered/stored goes beyond what the shop requires for its operation, eg. some form of analytics?,
then the question of whether permission is required or not comes into play again. It would therefore seem that
even (temporarily) storing something like a theme preference would require permission, hence the inclusion of the
'remember' checkbox (options.showRemember). The reasoning I have used is that if the preference already exists
on the user's computer then assume that permission has already been granted (checkbox checked); otherwise, assume
that it hasn't (checkbox unchecked). The checking of the checkbox by the user is taken as implicit permission, since
this plugin does not go to the lengths of explaining the consequences of doing so to the user ... I figure that's
down to the website content (T&C's?), if that is deemed to be necessary.

#### What are the options for 'remembering'?

The simplest one : just include Klaus Hartl's [cookie plugin](https://github.com/carhartl/jquery-cookie). A simple cookie,
with a string value for the name of the current theme, will be stored on the user's computer.

__*Important!*__ : This plugin does NOT include the $.cookie plugin! You will need to include it yourself.
