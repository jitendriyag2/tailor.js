function tailor() {
  // Only tailor the view if the user is not resizing the window.
  tailor.lastResizing = new Date().getTime();  
  if (!tailor.resizeTimer) {
    tailor.resizeTimer = setTimeout(tailor.attemptReload, tailor.settings.resizeThreshold);
  }
};

/*
 * This function is used to configure, or initialize, Tailor.js.
 * 
 * This is needed to make some educated choices and conversions in the absence
 * of certain values.
 *
 * Possible option values include:
 * framework: 'bootstrap'
 * version: '4.0.0-alpha', '3.3.5'
 */
tailor.configure = function(options) {
  var config = { resizeThreshold:tailor.settings.resizeThreshold };
  
  // Identify which framework settings to use.
  if (options.framework) {
    config.framework = options.framework;
    
    var frameworkKey = config.framework.toLowerCase();
    if (tailor.supported[frameworkKey]) {
      if (options.version) {
        config.version = options.version;
        
        // JavaScript names cannot contain '-' or '.'. For that reason, we replace them with '_'.
        // In addition, names must start with a letter. Since a lot of versions start with numbers, we prepend a 'v'.
        var frameworkVersion = 'v' + config.version.toLowerCase();
        frameworkVersion = frameworkVersion.replace('-', '_');
        frameworkVersion = frameworkVersion.replace('.', '_');
        
        if (tailor.supported[frameworkKey][frameworkVersion]) {
          tailor.breakpoints = tailor.supported[frameworkKey][frameworkVersion].breakpoints; 
        } else {
          // If the version is not supported, use the default values for the framework.
          tailor.breakpoints = tailor.supported[frameworkKey].defaults.breakpoints;            
        }          
      } else {
        // If the version was not specified, use the framework defaults.
        tailor.breakpoints = tailor.supported[frameworkKey].defaults.breakpoints;  
      }      
    } else {
      // If the framework is not supported, use the default values.
      tailor.breakpoints = tailor.supported.defaults.breakpoints;
    }    
  } else {
    // If the framework was not specified, use the default values.
    tailor.breakpoints = tailor.supported.defaults.breakpoints;    
  }
  
  // Identify the the current target type if it has not been specified
  if (options.targetType) {
    config.targetType = options.targetType;
  } else {
    document.addEventListener("DOMContentLoaded", function(event) {     
      config.targetType = tailor.getTargetType();
    });    
  }  
  tailor.settings = config;
};

/*
 * This function is used to determine if the page should be reloaded or not.
 */
tailor.attemptReload = function() {  
  var now = new Date().getTime();
  if ((now - tailor.lastResizing) > tailor.settings.resizeThreshold) {
    // Attempt to resize.
    if (tailor.resizeTimer) {
      clearTimeout(tailor.resizeTimer);
      tailor.resizeTimer = null;
    }
  
    var targetType = tailor.getTargetType();
    if (targetType != tailor.settings.targetType) {        
      tailor.settings.targetType = targetType;
//      console.log('Set content to ' + tailor.settings.targetType);
      location.reload();
    }
  } else {
    // Restart the timer
    tailor.resizeTimer = setTimeout(tailor.attemptReload, tailor.settings.resizeThreshold);
  }
};

/*
 * This is a utility method that helps identify what type of target
 * the screen width is associated with.
 */
tailor.getTargetType = function(t) {
  var targetType = tailor.breakpoints.length + 1;
  
  var width = document.body.scrollWidth; 
  for (var i=0; i<tailor.breakpoints.length; i++) {
    if (width < tailor.breakpoints[i]) {
      targetType = i + 1;
      break;
    }
  }
  
//  console.log('width: ' + width + '  targetType: ' + targetType + '  highest: ' + tailor.breakpoints[tailor.breakpoints.length-1]);     
  return targetType;
}

// lastResizing is an internal variable that should not be accessed outside of this library.
// This variable determines whether the user is in the process or resizing the window or not.
// It helps serve as a lock to prevent unnecessary refreshes.
tailor.lastResizing = null;

// resizeTimer is an internal variable that should not be accessed outside of this library.
// This variable is used as a handle to the timeout determine if the user is still resizing
// the window or not.
tailor.resizeTimer = null;

// breakpoints is an internal variable that should not be accessed outside of this library.
// This variable is used to determine where a screen resizing should occur.
tailor.breakpoints = [];

// The settings to use 
tailor.settings = {
  framework:null,
  version:null,
  targetType: null,
  resizeThreshold: 200
};

tailor.supported = {  
  // Bootstrap library settings
  bootstrap: {
    // The default values work with the following versions of Bootstrap:
    // 4.0.0-alpha
    // 3.3.5
    defaults : {
      breakpoints: [ 768, 992 ]
    }
  },
  
  // Settings for a custom library
  custom: {
    defaults: {
      breakpoints: []
    }
  },
  
  // Fallback values if nothing else is useful.
  defaults: {
    breakpoints: [ 640, 1024 ]
  }
};