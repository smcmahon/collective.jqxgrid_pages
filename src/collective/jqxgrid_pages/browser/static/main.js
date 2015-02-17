jQuery(function ($) {

    // console.log(data_source);
    // console.log(data_type);
    // console.log(data_definition);
    // console.log(column_definition);
    // console.log(display_options);

    // var jqxhr;

    // if (data_source === 'json') {
    //     jqxhr = $.getJSON(data_source);
    // } else {
    //     jqxhr = $.get(data_source);
    // }

    // jqxhr.done(function(data) {
    //     console.log( "success" );
    //     console.log(data);

    //     var data_adapter;

    //     if ($("#jqxgrid")) {

    //         data_adapter = new $.jqx.dataAdapter({
    //             datatype: data_type,
    //             datafields: data_definition,
    //             url: "http://192.168.1.6:7080/Plone/sample.xml",
    //             // localdata: data,
    //             root: "entry",
    //             record: "content",
    //             id: "m\\:properties>d\\:CustomerID"
    //             });

    //         $("#jqxgrid").jqxGrid({
    //             width: 850,
    //             source: data_adapter,
    //             sortable: display_options.search('Sortable') >= 0,
    //             filterable: display_options.search('Filter') >= 0,
    //             pageable: display_options.search('Paged') >= 0,
    //             autoheight: true,
    //             columnsresize: true,
    //             columns: column_definition
    //             });
    //     }
    // });

    // jqxhr.fail(function( jqxhr, textStatus, error ) {
    //     var err = textStatus + ", " + error;

    //     alert( "Request Failed: " + err );
    //     console.log( "Request Failed: " + err );
    // });

    // jqxhr.complete(function (data) {
    //     console.log('complete');
    //     console.log(data);
    // });

    if ($("#jqxgrid")) {
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
            width: 850,
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
});

