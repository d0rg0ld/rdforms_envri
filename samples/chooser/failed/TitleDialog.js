const _TemplatedMixin = require('dijit/_TemplatedMixin');
const _WidgetBase = require('dijit/_WidgetBase');
const declare = require('dojo/_base/declare');
//import { i18n, NLSMixin } from 'esi18n';
//import { isString } from 'lodash-es';
import DOMUtil from './htmlUtil.js';
import SideDialog from './SideDialog.js';

const template = '<div class="spaSideDialog spaHeaderDialog spaHeader" role="dialog" style="display:none"> \
    <div class="spaSideDialogUnderlay" data-dojo-attach-point="underlay"></div> \
    <div class="spaSideDialogContent" data-dojo-attach-point="dialogContent"> \
        <nav class="navbar navbar-light spaSideDialogHeaderNavbar"> \
            <div data-dojo-attach-point="headerNode" class="spaSideDialogHeader"> \
                <span class="navbar-brand sidebarTitle textTruncate" data-dojo-attach-point="titleNode"></span> \
            </div> \
            <button type="button" class="close" aria-label="Close" data-dojo-attach-point="close"> \
                <i class="fas fa-times" aria-hidden="true"></i> \
            </button> \
        </nav> \
        <div class="spaSideDialogBody"> \
            <div class="headerExtension" data-dojo-attach-point="headerExtensionNode"></div> \
            <div data-dojo-attach-point="containerNode"></div> \
            <div class="spaSideDialogErrors"> \
                <span data-dojo-attach-point="defaultMessage"></span> \
                <span class="alert alert-danger float-right" style="display: none" \
                      data-dojo-attach-point="errorMessageAlert" role="alert"> \
                    <span data-dojo-attach-point="errorMessage"></span> \
                    <button type="button" class="close" aria-label="Close" \
                            data-dojo-attach-event="onclick: closeErrorMessage"> \
                        <span aria-hidden="true">&times;</span> \
                    </button> \
                </span> \
            </div> \
        </div> \
        <nav class="navbar navbar-light navbar-fixed-bottom spaSideDialogFooterNavbar"> \
            <div data-dojo-attach-point="footerExtensionNode" class="container spaSideDialogFooter"> \
                <button type="button" class="btn btn-success btn-raised btn-block float-right" \
                        data-dojo-attach-event="onClick: footerButtonClick" \
                        data-dojo-attach-point="footerButtonNode"> \
                    <i data-dojo-attach-point="footerButtonSpinner" class="fas fa-spinner fa-spin" \
                       style="display:none;"></i> \
                    <span data-dojo-attach-point="footerButtonLabelNode"></span> \
                </button> \
            </div> \
        </nav> \
    </div> \
</div>';

/**
 * A SideDialog with a header and a footer.
 *
 * The header contains a configurable title and a close button (in the form of an X) on
 * the right of the title.
 *
 * The footer contains a single button aligned to the right with a configurable label
 * and title (html attribute, triggered via mouseover).
 *
 * Make sure you specify the nls keys to be used in the bundle (via the attributes
 * nlsHeaderTitle,
 * nlsFooterButtonLabel and nlsFooterButtonTitle), reasonable defaults are provided.
 */
const TitleDialog = declare([SideDialog], {
  templateString: template,
  nlsHeaderTitle: 'headerTitle',
  nlsFooterButtonLabel: 'footerButtonLabel',
  nlsFooterButtonTitle: '',
  includeFooter: true,
  maxWidth: 800, // Default
  // Attachpoints
  underlay: null,
  dialogContent: null,
  close: null,
  containerNode: null,
  footerButtonNode: null,
  footerButtonSpinner: null,
  headerNode: null,
  headerExtensionNode: null,
  titleNode: null,
  footerButtonLabelNode: null,
  defaultMessage: null,
  errorMessageAlert: null,
  errorMessage: null,

  postCreate() {
    this.inherited('postCreate', arguments);
    if (this.includeFooter) {
      this.domNode.classList.add('spaFooter');
    }
    this.close.onclick = this.conditionalHide.bind(this);
  },

  /**
   * Localize the title (in the header) and button (in the footer),
   * the nlsKeys used must be specified via the
   * nlsHeaderTitle, nlsFooterButtonLabel and nlsFooterButtonTitle attributes.
   *
   * @param {object} bundle the bundle with the localized strings.
   * @param {object} params to be used when localizing the strings, may be left out if
   * the title and label name is not parameterized.
   */
  updateLocaleStrings(bundle, params) {
    this.updateLocaleStringsExplicit(
      i18n.renderNLSTemplate(bundle[this.nlsHeaderTitle], params || {}),
      (bundle[this.nlsFooterButtonLabel || ''] ?
        i18n.renderNLSTemplate(bundle[this.nlsFooterButtonLabel], params || {}) : null),
      (bundle[this.nlsFooterButtonTitle || ''] ?
        i18n.renderNLSTemplate(bundle[this.nlsFooterButtonTitle], params || {}) : null),
    );
  },

  updateLocaleStringsExplicit(title, doneLabel, doneTitle) {
    if (this.titleNode != null) {
      m.render(this.titleNode, title);
    }
    if (doneLabel && this.footerButtonLabelNode != null) {
      m.render(this.footerButtonLabelNode, doneLabel);
    }
    if (doneTitle && this.footerButtonNode != null) {
      this.footerButtonNode.setAttribute('title', doneTitle);
    }
    this.updateHeaderWidth();
  },

  show() {
    this.inherited(arguments);
    this.closeErrorMessage();
    this.updateHeaderWidth();
  },

  updateHeaderWidth() {
    if (this.isHidden() || this.titleNode == null || this.headerNode == null
      || this.headerExtensionNode == null || this.containerNode == null) {
      return;
    }
    this.headerNode.classList.remove('multilineHeader');
    setTimeout(() => {
      const cbox = { w: this.headerNode.clientWidth, h: this.headerNode.clientHeight };
      const tbox = this.titleNode.getBoundingClientRect();
      const lbox = this.headerExtensionNode.getBoundingClientRect();

      // Extra 10px to avoid problems of redraw when it is really close
      if (tbox.width + lbox.width + 10 > cbox.w) {
        this.headerNode.classList.add('multilineHeader');
        setTimeout(() => {
          const pbox = { w: this.headerNode.parentNode.clientWidth, h: this.headerNode.parentNode.clientHeight };
          this.containerNode.style.top = `${pbox.h + 2}px`;
        }, 1);
      } else {
        this.containerNode.style.top = '';
      }
    }, 1);
  },

  closeErrorMessage() {
    this.errorMessageAlert.style.display = 'none';
    this.defaultMessage.style.display = '';
  },

  showErrorMessage(message) {
    this.defaultMessage.style.display = 'none';
    this.errorMessage.innerHTML = message;
    this.errorMessageAlert.style.display = '';
  },

  /**
   * Override and return a promise if asynchronous operation is required.
   */
  footerButtonAction() {
    // Override.
  },

  lockFooterButton() {
    this.lock = true;
    this.footerButtonNode.classList.add('disabled');
  },
  unlockFooterButton() {
    this.lock = false;
    this.footerButtonSpinner.style.display = 'none';
    this.footerButtonNode.classList.remove('disabled');
  },


  /**
   * Default behaviour closes the dialog, override if other behaviour is needed.
   */
  footerButtonClick() {
    if (this.lock) {
      return;
    }
    const res = this.footerButtonAction();
    if (res && typeof res.then === 'function') {
      this.lockFooterButton();
      this.footerButtonSpinner.style.display = '';
      res.then((status) => {
        this.unlockFooterButton();
        if (!(status && 'stopHide' in status)) {
          this.hide();
        }
      }, (err) => {
        if (isString(err)) {
          this.showErrorMessage(err);
        } else if (typeof err === 'object' && err.message) {
          this.showErrorMessage(err.message);
          if (err.keepButtonLocked) {
            this.footerButtonSpinner.style.display = 'none';
            return;
          }
        }
        this.unlockFooterButton();
      }).catch(console.log);
    } else if (res === true || typeof res === 'undefined') {
      this.hide();
    } else {
      this.showErrorMessage(res);
    }
  },
});


TitleDialog.Content = declare([_WidgetBase, _TemplatedMixin], {
  templateString: '<h1>Override me!</h1>',

  buildRendering() {
    const dialogNode = this.srcNodeRef || DOMUtil.create('div');
    this.dialog = new TitleDialog(SideDialog.createParams(this,
      ['indent', 'firstIndent', 'maxWidth', 'nlsHeaderTitle',
        'nlsFooterButtonLabel', 'nlsFooterButtonTitle', 'includeFooter',
        'destroyOnHide',
      ]), dialogNode);
    if (this.footerButtonAction) {
      this.dialog.footerButtonAction = this.footerButtonAction.bind(this);
    }
    this.srcNodeRef = DOMUtil.create('div', null, this.dialog.containerNode);
    this.inherited(arguments);
  },
});

TitleDialog.ContentNLS = declare([TitleDialog.Content, NLSMixin.Dijit], {
  nlsHeaderTitle: '',
  nlsFooterButtonLabel: '',
  nlsFooterButtonTitle: '',
  title: '',
  footerButtonLabel: '',
  footerButtonTitle: '',

  /**
   * Assumes you have either provided a title and closeLabel, or
   * an nlsBundles array with the name of the bundle to use and
   * the corresponding keys given by nlsHeaderTitle and nlsFooterButtonLabel.
   */
  localeChange() {
    if (this.title === '') {
      const bundle0 = this.NLSLocalized0;
      this.dialog.updateLocaleStrings(bundle0);
    } else {
      // @scazan THis is a "mock" sort of bundle so it needs to conform
      // to the bundle format
      const mesg = {};
      mesg[this.nlsHeaderTitle] = this.title;
      mesg[this.nlsFooterButtonLabel] = this.footerButtonLabel;
      mesg[this.nlsFooterButtonTitle] = this.footerButtonTitle;
      this.dialog.updateLocaleStrings(mesg);
    }
  },
});

TitleDialog.ContentComponent = declare([TitleDialog.ContentNLS], {
  destroyOnHide: true,
  show(component) {
    m.mount(this.dialog.containerNode, component);
  },
});

export default TitleDialog;

