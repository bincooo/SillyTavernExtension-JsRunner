// The main script for the extension
// The following are examples of some basic extension functionality

//You'll likely need to import extension_settings, getContext, and loadExtensionSettings from extensions.js
import { extension_settings, getContext, renderExtensionTemplateAsync, getApiUrl, doExtrasFetch } from "../../../extensions.js";

//You'll likely need to import some other functions from the main script
import * as script from "../../../../script.js";

import { debounce, delay } from "../../../../scripts/utils.js";

import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from '../../../slash-commands/SlashCommandArgument.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';

// Keep track of where your extension is located, name should match repo name
const extensionName = "SillyTavernExtension-JsRunner";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const templatePath = `third-party/${extensionName}`
const defaultSettings = {};

 
// Loads the extension settings if they exist, otherwise initializes them to the defaults.
async function loadSettings() {
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
        await javascriptEval(j.name, j.javascript)
      }
    }
  }
}

// This function is called when the button is clicked
async function onAddButtonClick() {
  // You can do whatever you want here
  // Let's make a popup appear with the checked setting
  const editorHtml = $(await renderExtensionTemplateAsync(templatePath, 'edit'));
  const popupResult = await script.callPopup(editorHtml, 'confirm', undefined, { okButton: 'Save' });
  if (popupResult) {
    extension_settings[extensionName].javascripts = extension_settings[extensionName].javascripts || [];
    extension_settings[extensionName].javascripts.push({
        enabled: true,
        name: editorHtml.find('.runner_script_name').val(),
        javascript: editorHtml.find('.runner_script_value').val(),
    })
    toastr.info("add success!");
    script.saveSettingsDebounced();
    await loadSettings();
  }
}

async function onEditButtonClick(index, data) {
    // You can do whatever you want here
    // Let's make a popup appear with the checked setting
    const editorHtml = $(await renderExtensionTemplateAsync(templatePath, 'edit'));
    editorHtml.find('.runner_script_name').val(data.name);
    editorHtml.find('.runner_script_value').val(data.javascript);
    const popupResult = await script.callPopup(editorHtml, 'confirm', undefined, { okButton: 'Save' });
    if (popupResult) {
      extension_settings[extensionName].javascripts = extension_settings[extensionName].javascripts || [];
      data = {...data,
        name: editorHtml.find('.runner_script_name').val(),
        javascript: editorHtml.find('.runner_script_value').val(),
      }
      extension_settings[extensionName].javascripts[index] = data;
      toastr.info("edit success!");
      script.saveSettingsDebounced();
      await loadSettings();
    }
}

async function javascriptEval(name, javascript) {
    try {
        const extensions = {
            getContext, toastr, doExtrasFetch, getApiUrl, debounce, delay,
        }
        const command = {
            SlashCommandParser,
            ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument
        }

        // 事件代码需考虑注册事件和注销事件的处理！
        Function("script, extensions, command", `with(script, extensions, command) { ${javascript} }`)
            .bind(window)(script, extensions, command)
    } catch(e) {
        console.error(e)
        toastr.error(`exec "${name}" error! check the exception information on the console.`);
    }
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
