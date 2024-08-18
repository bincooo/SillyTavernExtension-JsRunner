// The main script for the extension
// The following are examples of some basic extension functionality

//You'll likely need to import extension_settings, getContext, and loadExtensionSettings from extensions.js
import { extension_settings, getContext, writeExtensionField, renderExtensionTemplateAsync, getApiUrl, doExtrasFetch } from "../../../extensions.js";

//You'll likely need to import some other functions from the main script
import * as script from "../../../../script.js";

import { debounce, delay } from "../../../../scripts/utils.js";

import { playMessageSound } from '../../../../scripts/power-user.js';

import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from '../../../slash-commands/SlashCommandArgument.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';
import { SlashCommandScope } from '../../../slash-commands/SlashCommandScope.js';
import { SlashCommand } from '../../../SlashCommand.js';
import * as commands from '../../../slash-commands.js';

// Keep track of where your extension is located, name should match repo name
const extensionName = "SillyTavernExtension-JsRunner";
const extensionFolderPath = `/scripts/extensions/third-party/${extensionName}`;
const templatePath = `third-party/${extensionName}`
const defaultSettings = {};

 
// Loads the extension settings if they exist, otherwise initializes them to the defaults.
async function loadSettings() {
  if ($('#jed').length == 0) {
    $('body').append('<link href="' + extensionFolderPath + '/3rd/css/jsoneditor.min.css" rel="stylesheet">');
    $('body').append('<script id="jed" src="' + extensionFolderPath + '/3rd/js/jsoneditor.min.js"></script>');
  }

  if ($('#ace').length == 0) {
    $('body').append('<script id="ace" src="' + extensionFolderPath + '/3rd/js/ace/ace.js"></script>');
    $('body').append('<script src="' + extensionFolderPath + '/3rd/js/ace/ext-language_tools.js"></script>');
  }

  $(".runner-extension-settings .runner-extension_block").empty();
  //Create the settings if they don't exist
  extension_settings[extensionName] = extension_settings[extensionName] || {};
  if (Object.keys(extension_settings[extensionName]).length === 0) {
    Object.assign(extension_settings[extensionName], defaultSettings);
  }

  // Updating settings in the UI
  const javascripts = extension_settings[extensionName].javascripts
  if (javascripts) {
    for (const index in javascripts) {
      const j = javascripts[index]
      const blockHtml = $(await renderExtensionTemplateAsync(templatePath, 'block'));
      blockHtml.find(".runner_script_name").text(javascripts[index].name);
      if (!j.enabled) {
        blockHtml.find(".enabled_button i").removeClass("fa-toggle-on");
        blockHtml.find(".enabled_button i").addClass("fa-toggle-off");
      }
      blockHtml.attr("id", "runner-script_block-" + index)
      $(".runner-extension-settings .runner-extension_block").append(blockHtml);

      blockHtml.find(".enabled_button").on("click", async () => {
        extension_settings[extensionName].javascripts[index].enabled = !j.enabled;
        script.saveSettingsDebounced();
        await loadSettings();
      });
      blockHtml.find(".edit_button").on("click", async () => {
        onEditButtonClick(index, j)
      });
      blockHtml.find(".del_button").on("click", async () => {
        extension_settings[extensionName].javascripts.splice(index, 1);
        script.saveSettingsDebounced();
        await loadSettings();
      });

      if (j.enabled) {
        await javascriptEval(blockHtml, j.name, j.javascript)
      }
    }
  }
}

// This function is called when the button is clicked
async function onAddButtonClick() {
  let codeEditor = () => {
    $('.editor_maximize').on('click', function () {
      setTimeout(initCodeEditor, 100);
    });
  }
  // You can do whatever you want here
  // Let's make a popup appear with the checked setting
  const editorHtml = $(await renderExtensionTemplateAsync(templatePath, 'edit'));
  script.callPopup(editorHtml, 'confirm', undefined, { okButton: 'Save' }).then(popupResult => {
    if (popupResult) {
      extension_settings[extensionName].javascripts = extension_settings[extensionName].javascripts || [];
      extension_settings[extensionName].javascripts.push({
          enabled: true,
          name: editorHtml.find('.runner_script_name').val(),
          javascript: editorHtml.find('.runner_script_value').val(),
      })
      toastr.info("add success!");
      script.saveSettingsDebounced();
      loadSettings();
    }
  });
  codeEditor();
}

async function onEditButtonClick(index, data) {
  let codeEditor = () => {
    $('.editor_maximize').on('click', function () {
      setTimeout(initCodeEditor, 100);
    });
  }
  // You can do whatever you want here
  // Let's make a popup appear with the checked setting
  const editorHtml = $(await renderExtensionTemplateAsync(templatePath, 'edit'));
  editorHtml.find('.runner_script_name').val(data.name);
  editorHtml.find('.runner_script_value').val(data.javascript);
  script.callPopup(editorHtml, 'confirm', undefined, { okButton: 'Save' }).then(popupResult => {
    if (popupResult) {
      extension_settings[extensionName].javascripts = extension_settings[extensionName].javascripts || [];
      data = {...data,
        name: editorHtml.find('.runner_script_name').val(),
        javascript: editorHtml.find('.runner_script_value').val(),
      }
      extension_settings[extensionName].javascripts[index] = data;
      toastr.info("edit success!");
      script.saveSettingsDebounced();
      loadSettings();
    }
  });
  codeEditor();
}

async function javascriptEval(blockHtml, name, javascript) {
    const setting = () => {
      blockHtml.find('.setting_button').removeClass('disabled')
      return {
        on: (functionCall) => {
          blockHtml.find('.setting_button').on('click', functionCall)
        }
      }
    }

    try {
        const extensions = {
            getContext, toastr, doExtrasFetch, getApiUrl, debounce, delay, setting, initCodeEditor, initJsonEditor,
            writeExtensionField, playMessageSound,
        }
        const command = {
            ARGUMENT_TYPE, 
            SlashCommandParser, SlashCommandScope,
            SlashCommandArgument, SlashCommandNamedArgument, SlashCommand,
            ...commands,
        }

        // 事件代码需考虑注册事件和注销事件的处理！
        Function("script, extensions, command", `with(script, extensions, command) { ${javascript} }`)
            .bind(window)(script, extensions, command)
    } catch(e) {
        console.error(e)
        toastr.error(`exec "${name}" error! check the exception information on the console.`);
    }
}

async function initJsonEditor() {
  const textarea = $('dialog[class^=popup] .popup-content > div > textarea');
  const content = textarea.val() ?? '{}';
  textarea.css('display', 'none');
  $('body').addClass('noShadows-1');

  $('dialog[class^=popup] .popup-content > div').append('<div id="jsonEditor" class="height100p wide100p"></div>');
  const options = {
    onChangeJSON: (data) => {
      textarea.val(JSON.stringify(data, null, 4));
      textarea[0].dispatchEvent(new Event('input'));
    },
  }
  const editor = new JSONEditor(document.querySelector('#jsonEditor'), options);
  $(editor.menu).find('.jsoneditor-sort').hide();
  $(editor.menu).find('.jsoneditor-transform').hide();
  editor.set(JSON.parse(content));
  $('dialog[class^=popup] .popup-body .popup-button-ok').on('click', () => {
    $('body').removeClass('noShadows-1');
  });
}

async function initCodeEditor(language = "javascript", theme = "tomorrow_night") {
  const textarea = $('dialog[class^=popup] .popup-content > div > textarea');
  const content = textarea.val();
  // textarea.css('display', 'none');

  $('dialog[class^=popup] .popup-content > div').attr('id', 'codeEditor');

  //获取控件   id ：codeEditor
  const editor = ace.edit("codeEditor");
  //主题
  editor.setTheme("ace/theme/" + theme);
  //语言
  editor.session.setMode("ace/mode/" + language);
  //字体大小
  editor.setFontSize(15);
  //设置只读（true时只读，用于展示代码）
  editor.setReadOnly(false);
  //自动换行,设置为off关闭
  editor.setOption("wrap", "free");
  //启用提示菜单
  ace.require("ace/ext/language_tools");
  editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
  });

  editor.setValue(content);
  editor.on('change', () => {
    textarea.val(editor.getValue());
    textarea[0].dispatchEvent(new Event('input'));
  });
}

// This function is called when the extension is loaded
jQuery(async () => {
  // This is an example of loading HTML from a file
  const settingsHtml = $(await renderExtensionTemplateAsync(templatePath, 'panel'));

  // Append settingsHtml to extensions_settings
  // extension_settings and extensions_settings2 are the left and right columns of the settings menu
  // Left should be extensions that deal with system functions and right should be visual/UI related 
  $("#extensions_settings").append(settingsHtml);

  // These are examples of listening for events
  $("#add_button").on("click", onAddButtonClick);

  // Load settings when starting things up (if you have any)
  loadSettings();
});
