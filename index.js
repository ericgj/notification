
/**
 * Module dependencies.
 */

var domify = require('domify');
var classes = require('classes');
var onBody = require('on-body');

/**
 * Expose `notify`.
 */

exports = module.exports = notify;

/**
 * Notification list.
 */

var list = domify('<ul id="notifications">');

/**
 * Append to body when it exists.
 */

onBody(function (body) {
  body.appendChild(list);
});

/**
 * Return a new `Notification` with the given
 * (optional) `title` and `msg`.
 *
 * @param {String} title or msg
 * @param {String} msg
 * @return {Dialog}
 * @api public
 */

function notify(title, msg){
  switch (arguments.length) {
    case 2:
      return new Notification({ title: title, message: msg })
        .show()
        .hide(4000);
    case 1:
      return new Notification({ message: title })
        .show()
        .hide(4000);
  }
}

/**
 * Construct a notification function for `type`.
 *
 * @param {String} type
 * @return {Function}
 * @api private
 */

function type(type) {
  return function(title, msg){
    return notify.apply(this, arguments)
      .type(type);
  };
}

/**
 * Notification methods.
 */

exports.info = notify;
exports.warn = type('warn');
exports.error = type('error');

/**
 * Expose constructor.
 */

exports.Notification = Notification;

/**
 * Initialize a new `Notification`.
 *
 * Options:
 *
 *    - `title` dialog title
 *    - `message` a message to display
 *
 * @param {Object} options
 * @api public
 */

function Notification(options) {
  options = options || {};
  this.el = domify(require('./template'));
  this.render(options);
  if (options.classname) this.el.addClass(options.classname);
  if (Notification.effect) this.effect(Notification.effect);
}

/**
 * Render with the given `options`.
 *
 * @param {Object} options
 * @api public
 */

Notification.prototype.render = function(options){
  var el = this.el
    , title = options.title
    , msg = options.message
    , self = this;

  el.querySelector('.close').addEventListener('click', function(){
    self.hide();
    return false;
  });

  el.querySelector('.title').innerText = title;
  if (!title) el.querySelector('.title').remove();

  // message: note we simply assume it's a string here, not a sub-view
  // as in component/notification.
  el.querySelector('p').innerText = msg;

  setTimeout(function(){
    classes(el).remove('hide');
  }, 0);
};

/**
 * Enable the dialog close link.
 *
 * @return {Notification} for chaining
 * @api public
 */

Notification.prototype.closable = function(){
  classes(this.el).add('closable');
  return this;
};

/**
 * Set the effect to `type`.
 *
 * @param {String} type
 * @return {Notification} for chaining
 * @api public
 */

Notification.prototype.effect = function(type){
  this._effect = type;
  classes(this.el).add(type);
  return this;
};

/**
 * Show the notification.
 *
 * @return {Notification} for chaining
 * @api public
 */

Notification.prototype.show = function(){
  list.appendChild(this.el);
  return this;
};

/**
 * Set the notification `type`.
 *
 * @param {String} type
 * @return {Notification} for chaining
 * @api public
 */

Notification.prototype.type = function(type){
  this._type = type;
  classes(this.el).add(type);
  return this;
};

/**
 * Make it stick (clear hide timer), and make it closable.
 *
 * @return {Notification} for chaining
 * @api public
 */

Notification.prototype.sticky = function(){
  return this.hide(0).closable();
};

/**
 * Hide the dialog with optional delay of `ms`,
 * otherwise the notification is removed immediately.
 *
 * @return {Number} ms
 * @return {Notification} for chaining
 * @api public
 */

Notification.prototype.hide = function(ms){
  var self = this;

  // duration
  if ('number' == typeof ms) {
    clearTimeout(this.timer);
    if (!ms) return this;
    this.timer = setTimeout(function(){
      self.hide();
    }, ms);
    return this;
  }

  // hide / remove
  classes(this.el).add('hide');
  if (this._effect) {
    setTimeout(function(self){
      self.remove();
    }, 500, this);
  } else {
    self.remove();
  }

  return this;
};

/**
 * Hide the notification without potential animation.
 *
 * @return {Dialog} for chaining
 * @api public
 */

Notification.prototype.remove = function(){
  this.el.parentNode.removeChild(this.el);
  return this;
};
