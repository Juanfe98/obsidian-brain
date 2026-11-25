'use strict';

module.exports = function imageSizeDisabled() {
  throw new Error('image-size is disabled; deck-authoring validates and embeds image bytes before PptxGenJS');
};
