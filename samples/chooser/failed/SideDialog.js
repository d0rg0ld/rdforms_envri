const _TemplatedMixin = require('dijit/_TemplatedMixin');
const _WidgetBase = require('dijit/_WidgetBase');
const declare = require('dojo/_base/declare');
//const ally = require('ally.js');
import DOMUtil from './htmlUtil.js';
//import './dialog.scss';
const template = '<div class="spaSideDialog" role="dialog" style="display:none" > \
    <div class="spaSideDialogUnderlay" data-dojo-attach-point="underlay"></div> \
    <div class="spaSideDialogContent" data-dojo-attach-point="dialogContent,containerNode"></div> \
</div>';

const mobileMaxWidth = 415;
let level = 0;
let maxWidth = 0;
let maxWidthOwner = null;
let busy = false;

const SideDialog = declare([_WidgetBase, _TemplatedMixin], {
  templateString: template,
  indent: 25,
  firstIndent: 75,
  maxWidth: 0,
  _isHidden: true,
  destroyOnHide: false,
  keyHandle: null,
  tabHandle: null,
  focusedElementBeforeDialogOpen: null,
  myLevel: 0,

  postCreate() {
    this.inherited('postCreate', arguments);
    this.underlay.onclick = () => {
      if (!busy) {
        this.conditionalHide();
      }
    };
  },
  show() {
    this._isHidden = false;
    if (this._addedToDom !== true) {
      document.querySelector('#entryscapeDialogs').appendChild(this.domNode);
      this._addedToDom = true;
    }
    const box = {
      w: document.documentElement.clientWidth,
      h: document.documentElement.clientWidth,
    };
    const indent = (this.indent * level) + this.firstIndent;
    level += 1;
    this.myLevel = level;
    let end;
    let dialogWidth;
    if (maxWidth === 0 && this.maxWidth > 0 && this.maxWidth < box.w - this.indent) {
      maxWidth = this.maxWidth + this.indent;
      maxWidthOwner = this;
    }

    if (maxWidth > 0) {
      end = box.w - (maxWidth - indent);
      dialogWidth = maxWidth - indent;
    } else if (box.w < mobileMaxWidth) {
      end = 0;
      dialogWidth = box.w;
    } else {
      end = indent;
      dialogWidth = box.w - indent;
    }
    this.domNode.style.display = 'block';
    this.domNode.style.zIndex = `${1031 + level}`;
    this.domNode.style.opacity = 0;

    jquery(this.dialogContent).css({
      left: `${box.w}px`,
      right: `${-dialogWidth}px`,
    })
      .animate({
        left: `${end}px`,
        right: `${0}px`,
      });

    jquery(this.domNode).fadeTo(400, 1, () => {
      this.handleFocusOnShow();
    });

    const closeDialogByKey = this.conditionalHide.bind(this);
    //this.keyHandle = ally.when.key({
    //  escape: closeDialogByKey,
    //});
  },
  isHidden() {
    return this._isHidden;
  },
  conditionalHide() {
    // There's a key listener for each dialog. Conditional hide may fire many times, should only hide the top-most.
    if (this.myLevel === level) {
      this.hide();
    }
  },
  hide() {
    if (level <= 0) { // Avoid to many hide calls
      const err = new Error();
      console.warn(`Too many hide calls to sideDialog, check the code.\n${err.stack}`);
      return;
    }
    busy = true;
    level -= 1;
    const box = {
      w: document.documentElement.clientWidth,
      h: document.documentElement.clientWidth,
    };
    const indent = (this.indent * level) + this.firstIndent;
    let start;
    let dialogWidth;
    if (maxWidth > 0) {
      start = box.w - (maxWidth - indent);
      dialogWidth = maxWidth - indent;
    } else {
      start = indent;
      dialogWidth = box.w - indent;
    }

    jquery(this.dialogContent).css({
      left: `${start}px`,
      right: `${0}px`,
    })
      .animate({
        left: `${box.w}px`,
        right: `${-dialogWidth}px`,
      });

    jquery(this.domNode).fadeOut(() => {
      this.domNode.style.display = 'none';
      this._isHidden = true;
      busy = false;
      this.hideComplete();
      if (this.destroyOnHide) {
        this.destroy();
      }
    });

    if (this === maxWidthOwner) {
      maxWidth = 0;
      maxWidthOwner = null;
    }

    this.handleFocusOnHide();
    this.keyHandle.disengage();
  },
  hideComplete() {
  },
  handleFocusOnHide() {
    // Undo Tab key focus trap
    this.tabHandle.disengage();
    this.focusedElementBeforeDialogOpen.focus();
  },
  handleFocusOnShow() {
    this.focusedElementBeforeDialogOpen = document.activeElement;

    // Trap Tab key controlled focus within dialog tabsequence, disregarding browser UI.
    //this.tabHandle = ally.maintain.tabFocus({
    //  context: this.domNode,
    //});

    //const firstTabElement = ally.query.firstTabbable({
    //  context: this.domNode,
    //  defaultToContext: true,
    //});
    //if (firstTabElement) {
    //  firstTabElement.focus();
    //}
  },
});

SideDialog.createParams = (from, attrs) => {
  const obj = {};
  for (let i = 0; i < attrs.length; i++) {
    const p = attrs[i];
    if (typeof from[p] !== 'undefined') {
      obj[p] = from[p];
    }
  }
  return obj;
};

SideDialog.Content = declare([_WidgetBase, _TemplatedMixin], {
  templateString: '<h1>Override me!</h1>',

  buildRendering() {
    const dialogNode = this.srcNodeRef || DOMUtil.create('div');
    this.dialog = new SideDialog(SideDialog.createParams(this,
      ['indent', 'firstIndent', 'maxWidth']), dialogNode);
    this.srcNodeRef = DOMUtil.create('div', null, this.dialog.containerNode);
    this.inherited(arguments);
  },
});

export default SideDialog;

