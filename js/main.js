
    //Set up some Objects
    //CAP GEN page 31 Alternate Weather Minima Requirements
    let weatherMinima = {
        twoPA : {
            ceiling:200,vis:0.5
        },
        onePA : {ceiling:300,vis:1
        },
        NPA : {ceiling: 300, vis: 1
        }
    }

function createAlert(type,text) {
    //clear the alert first
    $('#erroricon').attr("class","bi me-2");
    $('div.alert').attr("class","alert d-flex align-items-center align-top");
    $('#alerttext').html("");

    //Set the alert
    if (type == "warning") {
        $('i.bi').addClass('bi-exclamation-triangle-fill');
        $('div.alert').addClass('alert-warning');
    }
    else if (type == "success") {
        $('i.bi').addClass('bi-check-circle-fill');
        $('div.alert').addClass('alert-success');
    }
    $('#alerttext').html(text);
    $('#errormessage').show();
}

// Adjust form based on which radio button is seleceted. 
    $('input[type=radio][name=approachtype]').change(function() {
    if (this.value == 'VFR') {
        $("#hat").attr("disabled", true);
        $("#vis").attr("disabled", true);
        $("#submit").attr("disabled", true);
        $("#hat").val("");
        $("#vis").val("");
        $('#errormessage').show();
        $('i.bi').addClass('bi-exclamation-triangle-fill');
        $('div.alert').addClass('alert-warning');
        $('#alerttext').html("Forecast weather must be no lower than 500' above a minimum IFR altitude that will permit a VFR approach and landing. (MSA?)");
    }
    else {
        $("#hat").attr("disabled", false);
        $("#vis").attr("disabled", false);
        $("#submit").attr("disabled", false);
        $('#errormessage').hide();
        $('i.bi').removeClass('bi-exclamation-triangle-fill');
        $('div.alert').removeClass('alert-warning');
    }
});

//Calculate stuff when the submit button is pressed.
$( "#alternateform" ).submit(function( event ) {
    event.preventDefault();

    // Add the ceiling and visibility to the alternate values
    let answer = {
        ceiling: parseInt(weatherMinima[$('input[name="approachtype"]:checked').val()].ceiling) + parseFloat($('#hat').val()),
        vis: parseInt(weatherMinima[$('input[name="approachtype"]:checked').val()].vis) + parseFloat($('#vis').val())
    };
    // Round the values down to lowest 100' up to 20' CAP GEN Page 32
    if (answer.ceiling %100 < 20) {
        answer.ceiling = answer.ceiling - (answer.ceiling %100);
    }
    else { // round up
        answer.ceiling = answer.ceiling + (100 - (answer.ceiling %100));
    }
    console.log(answer);
    if (answer.ceiling == 600 && answer.vis == 2) {

        text ="Standard Alternate Minima of " + answer.ceiling + "-" + answer.vis + " applies. Therefore, so do: 700-1.5 & 800-1";
        createAlert('success',text);

    }
    else if(answer.ceiling == 800 && answer.vis == 2) {

        text = "Standard Alternate Minima of " + answer.ceiling + "-" + answer.vis + " applies. Therefore, so do: 900-1.5 & 1000-1";
        createAlert('success',text);
    }
    else {
        $('#errormessage').show();
        $('i.bi').addClass('bi-exclamation-triangle-fill');
        $('div.alert').addClass('alert-warning');
        $('#alerttext').html("Non-Standard alternate minima of " + answer.ceiling + "-" + answer.vis + " Required");

    }
    



});

