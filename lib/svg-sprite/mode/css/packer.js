'use strict';

/**
 * svg-sprite is a Node.js module for creating SVG sprites
 *
 * @see https://github.com/svg-sprite/svg-sprite
 *
 * @author Joschi Kuphal <joschi@kuphal.net> (https://github.com/jkphl)
 * @copyright © 2018 Joschi Kuphal
 * @license MIT https://github.com/svg-sprite/svg-sprite/blob/main/LICENSE
 */

/**
 * CSS sprite packer
 *
 * @param {Array} shapes        Shapes
 */
function SVGSpriteCssPacker(shapes) {
    this.shapes = shapes;
    this.blocks = [];
    this.positions = [];

    this.shapes.forEach((shape, index) => {
        if (!shape.master) {
            const { width, height } = shape.getDimensions();
            this.blocks.push({ index, width, height });
        }

        this.positions.push({ x: 0, y: 0 });
    });

    this.blocks.sort((a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height));
    this.root = { x: 0, y: 0, width: 0, height: 0 };
}

/**
 * Prototype
 *
 * @type {Object}
 */
SVGSpriteCssPacker.prototype = {};

/**
 * Fit and return the shapes
 *
 * @return {Array} shapes       Packed shapes
 */
SVGSpriteCssPacker.prototype.fit = function() {
    const { length } = this.blocks;
    const width = length ? this.blocks[0].width : 0;
    const height = length ? this.blocks[0].height : 0;

    this.root.width = width;
    this.root.height = height;

    for (let b = 0; b < length; b++) {
        const node = this._findNode(this.root, this.blocks[b].width, this.blocks[b].height);
        const fit = node ? this._splitNode(node, this.blocks[b].width, this.blocks[b].height) : this._growNode(this.blocks[b].width, this.blocks[b].height);
        this.positions[this.blocks[b].index] = { x: fit.x, y: fit.y };
    }

    return this.positions;
};

/**
 * Find a node
 *
 * @param {Object} root         Root
 * @param {Number} width        Width
 * @param {Number} height       Height
 */
SVGSpriteCssPacker.prototype._findNode = function(root, width, height) {
    if (root.used) {
        return this._findNode(root.right, width, height) || this._findNode(root.down, width, height);
    }

    if (width <= root.width && height <= root.height) {
        return root;
    }

    return null;
};

/**
 * Split a node
 *
 * @param {Object} node         Node
 * @param {Number} width        Width
 * @param {Number} height       Height
 */
SVGSpriteCssPacker.prototype._splitNode = function(node, width, height) {
    node.used = true;
    node.down = {
        x: node.x,
        y: node.y + height,
        width: node.width,
        height: node.height - height
    };
    node.right = {
        x: node.x + width,
        y: node.y,
        width: node.width - width,
        height
    };

    return node;
};

/**
 * Grow the sprite
 *
 * @param {Number} width        Width
 * @param {Number} height       Height
 */
SVGSpriteCssPacker.prototype._growNode = function(width, height) {
    const canGrowBottom = width <= this.root.width;
    const canGrowRight = height <= this.root.height;
    const shouldGrowRight = canGrowRight && (this.root.height >= (this.root.width + width));
    const shouldGrowBottom = canGrowBottom && (this.root.width >= (this.root.height + height));

    if (shouldGrowRight) {
        return this._growRight(width, height);
    }

    if (shouldGrowBottom) {
        return this._growBottom(width, height);
    }

    if (canGrowRight) {
        return this._growRight(width, height);
    }

    if (canGrowBottom) {
        return this._growBottom(width, height);
    }

    return null;
};

/**
 * Grow the sprite to the right
 *
 * @param {Number} width        Width
 * @param {Number} height       Height
 */
SVGSpriteCssPacker.prototype._growRight = function(width, height) {
    this.root = {
        used: true,
        x: 0,
        y: 0,
        width: this.root.width + width,
        height: this.root.height,
        down: this.root,
        right: { x: this.root.width, y: 0, width, height: this.root.height }
    };
    const node = this._findNode(this.root, width, height);

    return node ? this._splitNode(node, width, height) : false;
};

/**
 * Grow the sprite to the bottom
 *
 * @param {Number} width        Width
 * @param {Number} height       Height
 */
SVGSpriteCssPacker.prototype._growBottom = function(width, height) {
    this.root = {
        used: true,
        x: 0,
        y: 0,
        width: this.root.width,
        height: this.root.height + height,
        down: { x: 0, y: this.root.height, width: this.root.width, height },
        right: this.root
    };
    const node = this._findNode(this.root, width, height);

    return node ? this._splitNode(node, width, height) : null;
};

/**
 * Module export
 */
module.exports = SVGSpriteCssPacker;
