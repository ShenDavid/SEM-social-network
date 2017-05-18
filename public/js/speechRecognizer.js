/**
 * Created by G on 17/4/29.
 */

"use strict";

var inputField = '';
var chooseBoxField = '';

function startConverting(category) {

    if ('webkitSpeechRecognition' in window) {
        var recognizer = new webkitSpeechRecognition();
        recognizer.continuous = true;
        recognizer.interimResults = true;
        recognizer.lang = 'en-IN';
        recognizer.start();
        var finalTranscripts = '';
        if(category === "fireFormPage"
            || category === "medicalFormPage" || category === "policeFormPage"){
            setTimeout(function alertFunc() {
                recognizer.stop();
            },120000);
        }else{
            setTimeout(function alertFunc() {
                recognizer.stop();
            },80000);
        }

        recognizer.onresult = function (event) {
            var interimTranscripts = '';
            for (var i = event.resultIndex; i < event.results.length; i++) {
                var transcript = event.results[i][0].transcript;
                transcript.replace("\\n", "<br>");
                if (event.results[i].isFinal) {
                    finalTranscripts += transcript;
                } else {
                    interimTranscripts += transcript;
                }
            }

            console.log("Testing transcript" + finalTranscripts);

            var currTokens = finalTranscripts.split(" ");

            if(category==='addressPage'){
                //Input Address
                if (currTokens.length >= 2 &&
                    (currTokens[currTokens.length - 2]=="input"||currTokens[currTokens.length - 2]=="type"||currTokens[currTokens.length - 2]=="enter") &&
                    currTokens[currTokens.length - 1]=="address"||currTokens[currTokens.length - 1]=="location"){

                    //locate to address buffer
                    inputField = 'address';
                    finalTranscripts = " ";
                }else if(currTokens.length >= 1 &&
                    currTokens[currTokens.length - 1]=="confirm"){
                    finalTranscripts = finalTranscripts.slice(0, -8);
                    document.getElementById('go').click();
                }else if(currTokens.length >= 1 &&
                    currTokens[currTokens.length - 1]=="next"){
                    //Next
                    document.getElementById('firstNext').click();
                    category = 'emergencyTypePage';
                    finalTranscripts = "";
                }
            }else if(category==='emergencyTypePage'){
                if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="fire"
                    && currTokens[currTokens.length - 1]=="emergency"){
                    document.getElementById('fireoption1').click();
                }else if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="medical"
                    && currTokens[currTokens.length - 1]=="emergency"){
                    document.getElementById('medicaloption2').click();
                }else if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="police"
                    && currTokens[currTokens.length - 1]=="emergency"){
                    document.getElementById('policeoption3').click();
                }else if(currTokens.length >= 1 &&
                    currTokens[currTokens.length - 1]=="next"){
                    document.getElementById('secondNext').click();
                }
                finalTranscripts = "";

            }else if(category==='medicalFormPage'){

                if(currTokens.length >= 1
                    // && currTokens[currTokens.length - 2]=="enter"
                    && currTokens[currTokens.length - 1]=="age"){
                    // document.getElementById('fireoption1').click();
                    inputField = 'age';
                    finalTranscripts = "";
                }else if(currTokens.length >= 1
                    && currTokens[currTokens.length - 1]=="sex"){
                    chooseBoxField = 'chooseSex';
                    finalTranscripts = "";
                }else if(currTokens.length >= 1
                    && currTokens[currTokens.length - 1]=="conscient"){
                    chooseBoxField = 'chooseConscient';
                    finalTranscripts = "";
                }else if(currTokens.length >= 1
                    && currTokens[currTokens.length - 1]=="breathing"){
                    chooseBoxField = 'chooseBreathing';
                    finalTranscripts = "";
                }else if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="Chief"
                    && currTokens[currTokens.length - 1]=="complaint"){
                    inputField = 'complaint';
                    finalTranscripts = "";
                }else if(currTokens.length >= 1 &&
                    currTokens[currTokens.length - 1]=="next"){
                    document.getElementById('thirdNext').click();
                }

                if(chooseBoxField === 'chooseSex'){
                    inputField='';
                    if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="male"){
                        $('input:radio[name="sex"][value="Male"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }else if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="female"){
                        $('input:radio[name="sex"][value="Female"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }
                }else if(chooseBoxField === 'chooseConscient'){
                    inputField='';
                    if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="yes"){
                        $('input:radio[name="Conscient"][value="Yes"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }else if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="no"){
                        $('input:radio[name="Conscient"][value="No"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }
                }else if(chooseBoxField === 'chooseBreathing'){
                    inputField='';
                    if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="yes"){
                        $('input:radio[name="isBreath"][value="Yes"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }else if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="no"){
                        $('input:radio[name="isBreath"][value="No"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }
                }


            }else if(category==='fireFormPage'){

                if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="smoke"
                    && currTokens[currTokens.length - 1]=="color"){
                    inputField = 'smokecolor';
                    finalTranscripts = "";
                }else if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="smoke"
                    && currTokens[currTokens.length - 1]=="quantity"){
                    inputField = 'smokequantity';
                    finalTranscripts = "";
                }else if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="structure"
                    && currTokens[currTokens.length - 1]=="type"){
                    inputField = 'structype';
                    finalTranscripts = "";
                }else if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="people"
                    && currTokens[currTokens.length - 1]=="inside"){
                    inputField = 'insidePeople';
                    finalTranscripts = "";
                }else if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="smell"
                    && currTokens[currTokens.length - 1]=="smoke"){
                    chooseBoxField = 'chooseSmellSmoke';
                    finalTranscripts = "";
                }else if(currTokens.length >= 1
                    && currTokens[currTokens.length - 1].toLowerCase()=="flame"){
                    chooseBoxField = 'chooseFlame';
                    finalTranscripts = "";
                }else if(currTokens.length >= 1
                    && currTokens[currTokens.length - 1]=="injuries"){
                    chooseBoxField = 'chooseInjuries';
                    finalTranscripts = "";
                }else if(currTokens.length >= 1
                    && currTokens[currTokens.length - 1]=="materials"){
                    chooseBoxField = 'chooseMaterials';
                    finalTranscripts = "";
                }else if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="get"
                    && currTokens[currTokens.length - 1]=="out"){
                    chooseBoxField = 'chooseGetOut';
                    finalTranscripts = "";
                }else if(currTokens.length >= 1 &&
                    currTokens[currTokens.length - 1]=="next"){
                    document.getElementById('thirdNext').click();
                }


                if(chooseBoxField === 'chooseSmellSmoke'){
                    inputField='';
                    if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="yes"){
                        $('input:radio[name="smoke"][value="Yes"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }else if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="no"){
                        $('input:radio[name="smoke"][value="No"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }
                }else if(chooseBoxField === 'chooseFlame'){
                    inputField='';
                    if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="yes"){
                        $('input:radio[name="flame"][value="Yes"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }else if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="no"){
                        $('input:radio[name="flame"][value="No"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }
                }else if(chooseBoxField === 'chooseInjuries'){
                    inputField='';
                    if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="yes"){
                        $('input:radio[name="injury"][value="Yes"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }else if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="no"){
                        $('input:radio[name="injury"][value="No"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }
                }else if(chooseBoxField === 'chooseMaterials'){
                    inputField='';
                    if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="yes"){
                        $('input:radio[name="hmaterial"][value="Yes"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }else if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="no"){
                        $('input:radio[name="hmaterial"][value="No"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }
                }else if(chooseBoxField === 'chooseGetOut'){
                    inputField='';
                    if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="yes"){
                        $('input:radio[name="getout"][value="Yes"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }else if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="no"){
                        $('input:radio[name="getout"][value="No"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }
                }

            }else if(category==='policeFormPage'){
                if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="suspect"
                    && currTokens[currTokens.length - 1]=="descriptions"){
                    inputField = 'suspect';
                    finalTranscripts = "";
                }else if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="vehicle"
                    && currTokens[currTokens.length - 1]=="descriptions"){
                    inputField = 'vehicle';
                    finalTranscripts = "";
                }else if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="suspect"
                    && currTokens[currTokens.length - 1]=="means"){
                    inputField = 'means';
                    finalTranscripts = "";
                }else if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="of"
                    && currTokens[currTokens.length - 1]=="travel"){
                    inputField = 'travel';
                    finalTranscripts = "";
                }else if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="of"
                    && currTokens[currTokens.length - 1]=="crime"){
                    inputField = 'detail';
                    finalTranscripts = "";
                }else if(currTokens.length >= 1
                    && currTokens[currTokens.length - 1]=="weapons"){
                    chooseBoxField = 'chooseWeapons';
                    finalTranscripts = "";
                }else if(currTokens.length >= 1
                    && currTokens[currTokens.length - 1]=="injured"){
                    chooseBoxField = 'chooseInjured';
                    finalTranscripts = "";
                }else if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="left"
                    && currTokens[currTokens.length - 1]=="scene"){
                    chooseBoxField = 'chooseLeftScene';
                    finalTranscripts = "";
                }else if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="you"
                    && currTokens[currTokens.length - 1]=="safe"){
                    chooseBoxField = 'chooseSafe';
                    finalTranscripts = "";
                }else if(currTokens.length >= 1 &&
                    currTokens[currTokens.length - 1]=="next"){
                    document.getElementById('thirdNext').click();
                }

                if(chooseBoxField === 'chooseWeapons'){
                    inputField='';
                    if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="yes"){
                        $('input:radio[name="weapon"][value="Yes"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }else if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="no"){
                        $('input:radio[name="weapon"][value="No"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }
                }else if(chooseBoxField === 'chooseInjured'){
                    inputField='';
                    if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="yes"){
                        $('input:radio[name="injured"][value="Yes"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }else if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="no"){
                        $('input:radio[name="injured"][value="No"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }
                }else if(chooseBoxField === 'chooseLeftScene'){
                    inputField='';
                    if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="yes"){
                        $('input:radio[name="left"][value="Yes"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }else if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="no"){
                        $('input:radio[name="left"][value="No"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }
                }else if(chooseBoxField === 'chooseSafe'){
                    inputField='';
                    if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="yes"){
                        $('input:radio[name="safe"][value="Yes"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }else if(currTokens.length >= 1 &&
                        currTokens[currTokens.length - 1]=="no"){
                        $('input:radio[name="safe"][value="No"]').attr('checked', 'checked');
                        chooseBoxField = '';
                    }
                }


            }else if(category==='chatPublicPage'){
                inputField = "msgIn";
                if(currTokens.length >= 2
                    && currTokens[currTokens.length - 2]=="send"
                    && currTokens[currTokens.length - 1]=="message"){
                    document.getElementById('sendMsg').click();
                    finalTranscripts = "";
                }
            }

            if(inputField !== ''){
                // End input to one text field
                if (currTokens.length >= 1 &&
                    currTokens[currTokens.length - 1]=="finished"){
                    inputField = '';
                    finalTranscripts = "";
                }else{
                    var messageBuffer = document.getElementById(inputField);
                    messageBuffer.value = ""+ finalTranscripts;
                    if (currTokens.length == 0){
                        // messageBuffer.value = "Speech recognizer ready ...";
                    }else if (currTokens.length >= 2 &&
                        currTokens[currTokens.length - 2]==("clear") &&
                        currTokens[currTokens.length - 1]=="message"){
                        // Discard Buffer Message without Sending
                        finalTranscripts = "";
                        messageBuffer.value = "Previous text discarded, speech recognizer ready ...";
                    }else if (currTokens.length >= 2 &&
                        (currTokens[currTokens.length - 2]==("Cancel"||"delete") &&
                        currTokens[currTokens.length - 1]=="message")
                        ||(currTokens[currTokens.length - 2]==("terminate"||"stop") &&
                        currTokens[currTokens.length - 1]=="recognizer")){
                        // Discard Buffer Message without Sending
                        recognizer.stop();
                    }else{
                        //Convert Messages without Sending or Aborting
                    }
                }
            }

        };

        recognizer.onerror = function (event) {
            console.log("Error " + event.error);
        };

        recognizer.onend = function (event) {
            recognizer.stop();
            console.log('stopped listening');
        };

    } else {
        // warning.innerHTML = 'Current browser is not supported. Please upgrade or change browser.';
    }
}