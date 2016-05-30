/*!
 * @class GstLaunch
 * @brief Class that encapsulates "gst-launch" executable.
 */
function GstLaunch() {
	
	const gst_launch_executable = 'gst-launch-1.0';
	const gst_launch_versionarg = '--version';
	
	const SpawnSync = require('child_process').spawnSync;
	const Spawn = require('child_process').spawn;
	const Assert = require('assert');
	
	/*!
	 * @fn getVersion
	 * @brief Returns version string of GStreamer on this machine by
	 * invoking the gst-launch executable or 'undefined' on failure.
	 */
	var getVersion = function() {
		try
		{
			var output = SpawnSync(
					gst_launch_executable,
					[gst_launch_versionarg],
					{ 'timeout' : 1000 })
				.stdout;
			
			if (output && output.toString().includes('GStreamer'))
			{
				return output
					.toString()
					.match(/GStreamer\s+.+/g)[0]
					.replace(/GStreamer\s+/,'');
			}
			else
			{
				console.log('Unable to execute gst-launch.');
				return undefined;
			}
		}
		catch(ex)
		{
			console.log('Failed to spawn gst-launch: ' + ex);
			return undefined;
		}
	}
	
	/*!
	 * @fn isAvailable
	 * @brief Answers true if gst-launch is available on PATH
	 */
	var isAvailable = function() {
		return getVersion() != undefined;
	}
	
	/*!
	 * @fn spawnPipeline
	 * @brief Spawns a GStreamer pipeline using gst-launch
	 * @return A Node <child-process> of the launched pipeline
	 * @see To construct a correct pipeline arg, consult the link below:
	 * https://gstreamer.freedesktop.org/data/doc/gstreamer/head/manual/html/chapter-programs.html
	 * @usage spawnPipeline('videotestsrc ! autovideosink')
	 */
	var spawnPipeline = function(pipeline) {
		Assert.ok(typeof(pipeline), 'string');
		Assert.ok(isAvailable(), "gst-launch is not available.");
		return Spawn(gst_launch_executable, pipeline.split(' '));
	}
	
	return {
		'getVersion' : getVersion,
		'isAvailable' : isAvailable,
		'spawnPipeline' : spawnPipeline
	}
	
}
