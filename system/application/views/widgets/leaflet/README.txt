Third-party map libraries vendored for the static site exporter's keyless maps
(see views/static_export/maps.php). Loaded only by exported sites, never by live Scalar.

  leaflet.js, leaflet.css, images/   Leaflet 1.9.4 (BSD-2-Clause)
  oms-leaflet.js                     OverlappingMarkerSpiderfier-Leaflet 0.2.7 (MIT)

Unmodified copies of the published npm files: leaflet@1.9.4/dist and
overlapping-marker-spiderfier-leaflet@0.2.7/build/oms.js. The spiderfier's own minified
dist/oms.js drops its copyright banner, so the unminified build is vendored instead.

  LICENSE-leaflet.txt        Leaflet's LICENSE file, verbatim.
  LICENSE-oms-leaflet.txt    The standard MIT text with the copyright line from the
                             spiderfier's source header. That project ships no LICENSE
                             file of its own; its package.json states MIT.

Both licences require the copyright and permission notices to travel with redistributed
copies, which is what these files are for. _copy_assets() bundles this whole directory into
every export, so the notices reach published sites too.
