
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



// Adjust form based on which radio button is seleceted. 
    $('input[type=radio][name=approachtype]').change(function() {
    if (this.value == 'VFR') {
        $("#hat").attr("disabled", true);
        $("#vis").attr("disabled", true);
        $("#submit").attr("disabled", true);

        $('#errormessage').html("Forecast weather must be no lower than 500' above a minimum IFR altitude that will permit a VFR approach and landing. (MSA?)");
    }
    else {
        $("#hat").attr("disabled", false);
        $("#vis").attr("disabled", false);
        $("#submit").attr("disabled", false);
        $('#errormessage').html("");
    }
});

//Calculate stuff when the submit button is pressed.
$( "#alternateform" ).submit(function( event ) {
    event.preventDefault();

    // Add the ceiling and visibility to the alternate values
    let answer = {
        ceiling: parseInt(weatherMinima[$('input[name="approachtype"]:checked').val()].ceiling) + parseInt($('#hat').val()),
        vis: parseInt(weatherMinima[$('input[name="approachtype"]:checked').val()].vis) + parseInt($('#vis').val())
    };
    // Round the values down to lowest 100' up to 20' CAP GEN Page 32
    if (answer.ceiling %100 < 20) {
        answer.ceiling = answer.ceiling - (answer.ceiling %100);
    }
    else { // round up
        answer.ceiling = answer.ceiling + (100 - (answer.ceiling %100));
    }

    console.log(answer);
    



});

