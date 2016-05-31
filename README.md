# livecam
Webcam live-streaming solution using GStreamer and Node.js

## installation
To obtain this module, type in `npm install livecam`.
You also need **GStreamer 1.3+** runtime installed on your machine.

### windows
depending on your architecture, you may [download the latest runtimes provided and maintained by the GStreamer project](https://gstreamer.freedesktop.org/data/pkg/windows/). They usually come in MSI installer format. You do not need the development installers. Naming of the runtime package follows the `gstreamer-1.0-<arch>-<version>.msi` convention.

After installation, make sure you have `GSTREAMER_1_0_ROOT_<arch>` environment variable defined in your system. This is a variable created by the MSI installer, pointing to where you installed the runtime package.

### linux
GStreamer might be already available on your machine. You may verify its existence by typing `gst-launch-1.0 --version` on your command line. If this command is not available, you can obtain GStreamer from your distro's package manager.

### mac osx
This module was never tested nor designed to run on Apple platforms, however if you wish to proceed with running it on an Apple platform, you may obtain GStreamer runtime via [Homebrew](http://brew.sh/).


## usage

```JS
// npm install livecam

const LiveCam = require('livecam');
const webcam_server = new LiveCam({
	'start' : function() {
		console.log('WebCam server started!');
	}
});

webcam_server.broadcast();
```

If all goes fine, you will see a message like this in your console:
`Open http://127.0.0.1:11000/ in your browser!`.

## configuration
`LiveCam ` takes an object in as its launch configuration:

```JS
// npm install livecam

const LiveCam = require('livecam');
const webcam_server = new LiveCam
({
	// address and port of the webcam UI
	'ui_addr' : '127.0.0.1',
	'ui_port' : 11000,

	// address and port of the webcam Socket.IO server
	// this server broadcasts GStreamer's video frames
	// for consumption in browser side.
	'broadcast_addr' : '127.0.0.1',
	'broadcast_port' : 12000,

	// address and port of GStreamer's tcp sink
	'gst_tcp_addr' : '127.0.0.1',
	'gst_tcp_port' : 10000,
	
	// callback function called when server starts
	'start' : function() {
		console.log('WebCam server started!');
	},
	
	// webcam object holds configuration of webcam frames
	'webcam' : {
		
		// should frames be converted to grayscale (default : false)
		'grayscale' : true,
		
		// should width of the frame be resized (default : 0)
		// provide 0 to match webcam input
		'width' : 800,

		// should height of the frame be resized (default : 0)
		// provide 0 to match webcam input
		'height' : 600,
		
		// should a fake source be used instead of an actual webcam
		// suitable for debugging and development (default : false)
		'fake' : false,
		
		// framerate of the feed (default : 0)
		// provide 0 to match webcam input
		'framerate' : 25
	}
});
```

In the configuration above:

**NOTE 1** *broadcast address* and *UI address* need to be visible to each other.
**NOTE 2** *broadcast address* and *gst_tcp address* need to be visible to each other.
**NOTE 3** *UI address* and *gst_tcp address* need **NOT** to be visible to each other.

That means you can hide *gst_tcp address* behind your firewall.

## FAQ

 - **Q. What's the max resolution supported for broadcast?**
 **A.** This is a very generic and broad question, and the answer to it is highly platform, network, and hardware dependent. If you are looking for a generic answer, I have successfully streamed *1920x1080@30fps* in my home network to five different clients (including a Galaxy Edge) at once.

 - **Q. Can this module stream a static file instead of a webcam?**
 **A.** Yes. in `livecam.js`, look for `gst_video_src` variable and assign the following value to it:
```JS
// assuming you're on Windows and the file is on C:\videos\stream.mp4
// NOTE the four backslashes!
var gst_video_src = 'filesrc location="C:\\\\videos\\\\stream.mp4"'
```

## license
[LGPL-v3.0](https://gstreamer.freedesktop.org/documentation/licensing.html).
