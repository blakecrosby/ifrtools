
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
        alternateMinima = [[600,2],[700,1.5],[800,1]];
        text ="Standard Alternate Minima of " + answer.ceiling + "-" + answer.vis + " applies. Therefore, so do: 700-1.5 & 800-1";
        createAlert('success',text);

    }
    else if(answer.ceiling == 800 && answer.vis == 2) {
        alternateMinima = [[800,2],[900,1.5],[1000,1]];
        text = "Standard Alternate Minima of " + answer.ceiling + "-" + answer.vis + " applies. Therefore, so do: 900-1.5 & 1000-1";
        createAlert('success',text);
    }
    else {
        alternateMinima = [[answer.ceiling,answer.vis],[answer.ceiling,answer.vis],[answer.ceiling,answer.vis]]
        $('#errormessage').show();
        $('i.bi').addClass('bi-exclamation-triangle-fill');
        $('div.alert').addClass('alert-warning');
        $('#alerttext').html("Non-Standard alternate minima of " + answer.ceiling + "-" + answer.vis + " Required");

    }
    
    //Fetch the TAF for the airport
    $.ajax({
        type: "GET",
        url: "https://avwx.rest/api/taf/" + $('#airport').val(),
        dataType: 'json',
        headers: {
            "Authorization": "BEARER " + '1nM1GdSFgSH9lQC6Ul29SqrNj4fJw22J4bWwxrDrAWw'
        },
        success: function (result){
            console.log(result)

            fetch_time = new Date(result.time.dt);
            start_time = new Date(result.start_time.dt);
            end_time = new Date (result.end_time.dt);

            valid = fetch_time.toLocaleString('default', { month: 'long' }) + " " + fetch_time.getDate() + " at " + fetch_time.getUTCHours() + ":" + fetch_time.getMinutes() +"Z";
            starttime = start_time.toLocaleString('default', { month: 'long' }) + " " + start_time.getDate() + " " + start_time.getUTCHours() + ":" + String(start_time.getMinutes()).padStart(2, '0') +"Z";
            endtime = end_time.toLocaleString('default', { month: 'long' }) + " " + end_time.getDate() + " " + end_time.getUTCHours() + ":" + String(end_time.getMinutes()).padStart(2, '0')+"Z";

            $('#tafValid').html("TAF For " + $('#airport').val() + " valid: " + valid + " for " + starttime + " to " + endtime);

            for (const forecast of result.forecast) {
                start_time = new Date(forecast.start_time.dt);
                end_time = new Date(forecast.end_time.dt);
                var ceiling;
                var visibility;
                var wind;
                var forecasttype;
                wx ='';
                allowed = true;
                tableRow = "<tr>";

                
                for (const clouds of forecast.clouds) { //get the lowest ceiling
                    if ((clouds.type == "BKN") || (clouds.type == "OVC") || (clouds.type = "VV")) {
                        ceiling = forecast.clouds[0].repr;
                        ceilingHeight = forecast.clouds[0].altitude*100;
                    }
                }
                for (const weather of forecast.wx_codes) { //get the lowest ceiling
                    wx = wx + weather.value + " ";
                }
                if (forecast.visibility == null) {
                    visibiity = null;
                }
                else if (forecast.visibility.repr !== 'P6') {
                    visibility = forecast.visibility.value;
                }
                else {
                    visibility = '6';
                }
                if (forecast.wind_direction !== null && forecast.wind_gust !== null) {
                    wind = forecast.wind_direction.repr + "@" + forecast.wind_speed.value + "G" + forecast.wind_gust.value;
                    //wx = "Wind Shift";
                }
                else if (forecast.wind_direction !== null) {
                    wind = forecast.wind_direction.repr + "@" + forecast.wind_speed.value
                }
                if (forecast.probability !== null) {
                    forecasttype = "PROB" + forecast.probability.value
                }
                else {
                    forecasttype = forecast.type;
                }
                
                // Priority of rules
                // PROB must be higher than the landing minima and applies to the entire time block
                // TEMPO must be higher than the alternate landing minima and applies to the entire time block
                // BECMG must be higher than the alternate landing minima and applies to the BECMG time block
                if (forecast.probability !== null) {
                    if (ceilingHeight < $('#dh').val() || visibility < $('#vis').val()){
                        allowed = false;
                        tableRow = "<tr class=\"table-danger\">";
                        
                    }
                } 
                else if (forecasttype == "TEMPO" || forecasttype == "FROM") {
                    //fix bug
                    if ((ceilingHeight < alternateMinima[0][0] || visibility < alternateMinima[0][1]) || 
                    (ceilingHeight < alternateMinima[1][0] || visibility < alternateMinima[1][1]) || 
                    (ceilingHeight < alternateMinima[2][0] || visibility < alternateMinima[1][1])) {
                            allowed = false;
                            tableRow = "<tr class=\"table-danger\">";
                        }
                }

                if (forecasttype == "FROM") {
                    time = "From: " + String(start_time.getUTCHours()).padStart(2, '0') +"Z" + "-" + String(end_time.getUTCHours()).padStart(2, '0') +"Z";
                }
                else if (forecasttype == "TEMPO") {
                    time = "&nbsp;&nbsp;Temporarily until: " + String(end_time.getUTCHours()).padStart(2, '0') +"Z";
                }
                else if (forecasttype == "BECMG") {
                    time = "&nbsp;&nbsp;Becoming: " + String(start_time.getUTCHours()).padStart(2, '0') +"Z" + "-" + String(end_time.getUTCHours()).padStart(2, '0') +"Z";
                }
                else if (forecasttype == "PROB30" || forecasttype == "PROB40") {
                    time = "&nbsp;&nbsp;" + forecast.probability.value +"% probability until: "+ String(end_time.getUTCHours()).padStart(2, '0') +"Z";
                }
                forecastOutput = tableRow + "<td>" + time + "</td><td>" + wind +"</td><td>"+ ceiling +" "+ wx + "</td><td>" + visibility + "</td><td>" +"</tr>";
                $("#taftable tbody").append(forecastOutput);
                ceiling = '';
                visibility = '';

                
                

            }
        }

        });


});

