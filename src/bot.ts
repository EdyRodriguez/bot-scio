// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { DialogBot } = require('./dialogBot');
const { UserProfile } = require('./userProfile');
export const userInfo = new UserProfile();

class welcomeBot extends DialogBot {
    constructor(conversationState, userState, dialog) {
        super(conversationState, userState, dialog);
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    const reply = `Welcome, this is a demo bot with limited functions. Type anything to get started.`;
                    await context.sendActivity(reply);
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
        this.onTurn(async (context, next) => {

           const temp = context.activity.value;
           if (temp && temp.myName && temp.myVideogame && temp.myAge && temp.myNumber)   {
           userInfo.Name = temp.myName;
           userInfo.Age = temp.myAge;
           userInfo.Number = temp.myNumber;
           userInfo.Videogames = temp.myVideogame;
           }
            // By calling next() you ensure that the next BotHandler is run.
            
            await next();


                
                
        });
    }
}

module.exports.DialogAndWelcomeBot = welcomeBot;