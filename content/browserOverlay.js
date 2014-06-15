Components.utils.import("resource://gre/modules/Downloads.jsm");
Components.utils.import("resource://gre/modules/osfile.jsm");
Components.utils.import("resource://gre/modules/Task.jsm");

/**
 * girafotodownloader namespace.
 */
if ("undefined" == typeof(GiraFotoLTN)) {
  var GiraFotoLTN = {};
};

/**
 * Controls the browser overlay for the Hello World extension.
 */
 GiraFotoLTN.BrowserOverlay = {
  /**
   * Says 'Hello' to the user.
   */
  downloadPictures : function(aEvent) {
      var win = Components.classes["@mozilla.org/appshell/window-mediator;1"]
          .getService(Components.interfaces.nsIWindowMediator)
          .getMostRecentWindow("navigator:browser");
      var urlOfPage = win.getBrowser().selectedBrowser.contentWindow.location.href;
      if(urlOfPage.indexOf("http://www.girafoto.fr/fr/shared-album-slideshow/") == 0) {
          // Get folder
          var nsIFilePicker = Components.interfaces.nsIFilePicker;
          var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
          fp.init(window, "Select a File", nsIFilePicker.modeGetFolder);
          var res = fp.show();
          if (res != nsIFilePicker.returnCancel) {
              this.selectedFolderPath = fp.file.path;
              var that = this;
              // Second iteration: get every pic
              var req = new XMLHttpRequest();
              req.open('GET', urlOfPage, true);
              req.onreadystatechange = function (aEvt) {
                  if (req.readyState == 4) {
                      if (req.status == 200) {
                          // work with req.responseText
                          var divEl = content.document.createElement('div');
                          divEl.innerHTML = req.responseText;
                          var pictures = divEl.querySelectorAll("#galleria a");

                          for (var i = 0; i < pictures.length; ++i) {
                              that.savePictureToPath("http://" + win.getBrowser().selectedBrowser.contentWindow.location.hostname + pictures[i].getAttribute('href'));
                          }
                      }
                      else
                          window.alert("Erreur pendant le chargement de la page.\n");
                  }
              };
              req.send(null);
          }
      }
  },

  savePictureToPath: function(picUrl) {
      var picUrlSplitted = picUrl.split("/");
      var fileName = picUrlSplitted[picUrlSplitted.length - 1];
      var that = this;
      Task.spawn(function () {

          yield Downloads.fetch(picUrl,
              OS.Path.join(that.selectedFolderPath,
                  fileName + ".jpeg"));

      }).then(null, Components.utils.reportError);
  }
};
