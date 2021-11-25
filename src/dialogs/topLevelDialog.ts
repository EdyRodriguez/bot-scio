// Copyright (c) Microsoft Corporation. All rights reserved.

import { Activity, CardFactory } from "botbuilder-core";
import * as ACData from "adaptivecards-templating";
import * as AdaptiveCard from "../card/userCard.json";
import { userInfo } from "../bot";
import { ConfirmPrompt } from "botbuilder-dialogs";
import axios from "axios";
// Licensed under the MIT License.
export {};
const { ComponentDialog, NumberPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { ReviewSelectionDialog, REVIEW_SELECTION_DIALOG } = require('./reviewSelectionDialog');
const { UserProfile } = require('../userProfile');


const TOP_LEVEL_DIALOG = 'TOP_LEVEL_DIALOG';

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';

class TopLevelDialog extends ComponentDialog {
    
    constructor() {
        
        super(TOP_LEVEL_DIALOG);
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new ReviewSelectionDialog());

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.numberStep.bind(this),
            this.nameStep.bind(this),
            this.ageStep.bind(this),
            this.videogameStep.bind(this),
            this.showCardStep.bind(this),
            this.startSelectionStep.bind(this),
            this.acknowledgementStep.bind(this),
            this.resume.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    

    async numberStep(stepContext) {
        // Create an object in which to collect the user's information within the dialog.
        stepContext.values.userInfo = userInfo;

        const promptOptions = { prompt: 'Please enter your phone number. remember that it must be 10 digits ' };

        // Ask the user to enter their name.
        return await stepContext.prompt(NUMBER_PROMPT, promptOptions);
    }

    async nameStep(stepContext) {
        // Create an object in which to collect the user's information within the dialog.
        stepContext.values.userInfo.Number = stepContext.result;

        const promptOptions = { prompt: 'Please enter your name.' };

        // Ask the user to enter their name.
        return await stepContext.prompt(TEXT_PROMPT, promptOptions);
    }
    

    async ageStep(stepContext) {
        // Set the user's name to what they entered in response to the name prompt.
        stepContext.values.userInfo.Name = stepContext.result;

        const promptOptions = { prompt: 'Please enter your age.' };

        // Ask the user to enter their age.
        return await stepContext.prompt(NUMBER_PROMPT, promptOptions);
    }
    async videogameStep(stepContext) {
        // Set the user's name to what they entered in response to the name prompt.
        
        stepContext.values.userInfo.Age = stepContext.result;
        const promptOptions = { prompt: 'Please enter your favorite videogame title' };

        // Ask the user to enter their age.
        return await stepContext.prompt(TEXT_PROMPT, promptOptions);
    }

    async showCardStep(stepContext) {
        // Send a greeting card, and end the dialog.
        stepContext.values.userInfo.Videogames = stepContext.result;
        const template = new ACData.Template(AdaptiveCard);
        const builtCard = template.expand({ $root: {name : stepContext.values.userInfo.Name, number : String(stepContext.values.userInfo.Number), age : String(stepContext.values.userInfo.Age), videogame : stepContext.values.userInfo.Videogames} });
        const activity: Partial <Activity> = {
            attachments: [ CardFactory.adaptiveCard(builtCard) ],
            };
           await stepContext.context.sendActivity(activity);
           const promptOptions = { prompt: 'Write yes to save and continue' };
        return await stepContext.prompt(TEXT_PROMPT, promptOptions);
    }
    async startSelectionStep(stepContext) {
        if(stepContext.result === 'yes'){
        stepContext.values.userInfo.Save = true;
        }
        else{
            stepContext.values.userInfo.Save = false;
        }
            // Otherwise, start the review selection dialog.
            return await stepContext.beginDialog(REVIEW_SELECTION_DIALOG);
        
    }

    
    async acknowledgementStep(stepContext) {
        // Set the user's company selection to what they entered in the review-selection dialog.
        userInfo.Genders = stepContext.result || [];
        console.log(userInfo);
        
        const promptOptions = { prompt: 'Do you want to save your results?' };
     return await stepContext.prompt(CONFIRM_PROMPT, promptOptions);

        // Exit the dialog, returning the collected user information.

        
    }
    async resume(stepContext) {
        userInfo.Save = stepContext.result;
        const genre = userInfo.Genders[0];
        if(userInfo.Save){
            if(userInfo.Genders.length >1){
                const genre = userInfo.Genders[0]+', '+userInfo.Genders[1];
            }
            axios.post('http://localhost:8000/api/users', {
                name: userInfo.Name,
                number: String(userInfo.Number),
                age: String(userInfo.Age),
                videogame: userInfo.Videogames,
                genres: genre
              })
              .then(function (response) {
                console.log(response);
              })
              .catch(function (error) {
                console.log(error);
              });
            
            await stepContext.context.sendActivity(`Your results will be saved`);
            
        }
        else{
        await stepContext.context.sendActivity(`Your results won't be saved`);
        }
    return await stepContext.endDialog();
    }
    

    
    
}

module.exports.TopLevelDialog = TopLevelDialog;
module.exports.TOP_LEVEL_DIALOG = TOP_LEVEL_DIALOG;
