'use strict'

/**
 * Module dependencies.
 */

import { MediaCommand } from './media'
import { define } from '../utils'
import raf from 'raf'

/**
 * VideoCommand constructor.
 * @see VideoCommand
 */

export default (...args) => new VideoCommand(...args)

/**
 * VideoCommand class.
 *
 * @public
 * @extends MediaCommand
 */

export class VideoCommand extends MediaCommand {
  constructor(ctx, src) {
    let source = null

    super(ctx, {
      video: {
        stream: true,
        type: 'video',
        src: src
      }
    })

    /**
     * Source attribute accessor.
     *
     * @type {String}
     */

    define(this, 'src', {
      get: () => {
        return (source && source.src) ?
          source.src :
          (this.manifest && this.manifest.video) ?
            this.manifest.video.src :
            null
      },

      set: (value) => {
        if (source && 'string' == typeof value) {
          source.src = value
          if (this.manifest && this.manifest.video) {
            this.manifest.video.src = value
            this.reset()
            this.load()
          }
        }
      }
    })

    /**
     * Video texture target.
     *
     * @type {REGLTexture}
     */

    this.texture = ctx.regl.texture()

    /**
     * Callback when photo has loaded.
     *
     * @type {Function}
     */

    this.onloaded = ({video}) => {
      source = video
      this.texture(video)
      const loop = () => {
        raf(loop)
        if (this.isDoneLoading) {
          this.texture = this.texture.subimage(video)
        }
      }
      raf(loop)
    }

    /**
     * Callback when photo has load progress.
     *
     * @type {Function}
     */

    this.onprogress = () => void 0

    /**
     * Callback when photo has loading has
     * encountered an error.
     *
     * @type {Function}
     */

    // @TODO(werle) - handle errors better
    this.onerror = (err) => console.error(err)

    /**
     * Plays the video.
     *
     * @return {VideoCommand}
     */

    this.play = () => {
      source.play()
      return this
    }

    /**
     * Pauses the video.
     *
     * @return {VideoCommand}
     */

    this.pause = () => {
      source.pause()
      return this
    }
  }
}
