jQuery(function ($) {

    // construct grid
    if ($("#jqxgrid").length) {
        var data_source = $('#data_source').text(),
            data_type = $('#data_type').text().toLowerCase(),
            data_record = $('#data_record').text(),
            data_root = $('#data_root').text(),
            data_definition = $('#data_definition').text(),
            column_definition = $('#column_definition').text(),
            display_options = $('#display_options').text(),
            data_spec,
            data_adapter,
            jqxgrid_options;

        // console.log(data_source);
        // console.log(data_type);
        // console.log(data_definition);
        // console.log(column_definition);
        // console.log(display_options);

        try {
            data_definition = $.parseJSON(data_definition);
        } catch(err) {
            alert("Unable to parse Data Definition: " + err.message);
            return;
        }
        try {
            column_definition = $.parseJSON(column_definition);
        } catch(err) {
            alert("Unable to parse Column Definition: " + err.message);
            return;
        }

        jqxgrid_options = {
            width: "100%",
            sortable: display_options.search('Sortable') >= 0,
            filterable: display_options.search('Filter') >= 0,
            pageable: display_options.search('Paged') >= 0,
            autoheight: true,
            columnsresize: true,
            columns: column_definition
            };

        if (data_type === 'jsonp') {
            // the url mechanism for jsonp is not working (or I don't know how to
            // use it).

            $.getJSON(data_source)
                .done(function (data) {
                    data_spec = {
                        datafields: data_definition,
                        datatype: 'json',
                        localdata: data
                        };
                    data_adapter = new $.jqx.dataAdapter(data_spec);
                    jqxgrid_options['source'] = data_adapter;
                    $("#jqxgrid").jqxGrid(jqxgrid_options);
                    })
                .fail(function( jqxhr, textStatus, error ) {
                    alert( "Request Failed: " + textStatus + ", " + error );
                    });
        } else {
            data_spec = {
                datafields: data_definition,
                datatype: data_type,
                url: data_source
            };
            if (data_type === 'xml') {
                data_spec['root'] = data_root;
                data_spec['record'] = data_record;
            }
            data_adapter = new $.jqx.dataAdapter(data_spec);
            jqxgrid_options['source'] = data_adapter;
            $("#jqxgrid").jqxGrid(jqxgrid_options);
        }
    }


    if ($("body.template-edit.portaltype-jqxgrid_page").length) {
        $("#form-widgets-data_type").change(function(event) {
            var controls = $("#formfield-form-widgets-data_root, #formfield-form-widgets-data_record");

            if($("#form-widgets-data_type").val() === 'XML') {
                controls.fadeIn();
            } else {
                controls.fadeOut();
            }
        });
    }

});

