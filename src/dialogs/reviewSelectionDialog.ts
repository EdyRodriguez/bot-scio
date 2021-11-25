// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
export {};
const { ChoicePrompt, ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

const REVIEW_SELECTION = 'REVIEW_SELECTION_DIALOG';

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const WATERFALL = 'WATERFALL_DIALOG';

class ReviewSelection extends ComponentDialog {
    constructor() {
        super(REVIEW_SELECTION);

        // Define a "done" response for the company selection prompt.
        this.finishOption = 'finish';

        // Define value names for values tracked inside the dialogs.
        this.gendersSelected = 'value-gendersSelected';

        // Define the company choices for the company selection prompt.
        this.genderOptions = ['FPS', 'RTS', 'Battle Royal', 'Indie'];

        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL, [
            this.selectionStep.bind(this),
            this.loopStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL;
    }

    async selectionStep(stepContext) {
        // Continue using the same selection list, if any, from the previous iteration of this dialog.
        const list = Array.isArray(stepContext.options) ? stepContext.options : [];
        stepContext.values[this.gendersSelected] = list;

        // Create a prompt message.
        let message = '';
        if (list.length === 0) {
            message = `Please select your favorite game gender, or \`${ this.finishOption }\` to finish.`;
        } else {
            message = `You have selected **${ list[0] }**. You can choose another gender if you want, or choose \`${ this.finishOption }\` to finish.`;
        }

        // Create the list of options to choose from.
        const options = list.length > 0
            ? this.genderOptions.filter(function(item) { return item !== list[0]; })
            : this.genderOptions.slice();
        options.push(this.finishOption);

        // Prompt the user for a choice.
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: message,
            retryPrompt: 'Please choose an option from the list.',
            choices: options
        });
    }

    async loopStep(stepContext) {
        // Retrieve their selection list, the choice they made, and whether they chose to finish.
        const list = stepContext.values[this.gendersSelected];
        const choice = stepContext.result;
        const done = choice.value === this.finishOption;

        if (!done) {
            // If they chose a company, add it to the list.
            list.push(choice.value);
        }

        if (done || list.length > 1) {
            // If they're done, exit and return their list.
            return await stepContext.endDialog(list);
        } else {
            // Otherwise, repeat this dialog, passing in the list from this iteration.
            return await stepContext.replaceDialog(REVIEW_SELECTION, list);
        }
    }
}

module.exports.ReviewSelectionDialog = ReviewSelection;
module.exports.REVIEW_SELECTION_DIALOG = REVIEW_SELECTION;
