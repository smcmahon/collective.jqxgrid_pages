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

    // edit form fiddling
    if ($("body.template-edit.portaltype-jqxgrid_page").length) {
        var target,
            target_value,
            data,
            ddgrid,
            updateDataDefinition;

        // toggle display of xml-specific fields
        $("#form-widgets-data_type").change(function(event) {
            var controls = $("#formfield-form-widgets-data_root, #formfield-form-widgets-data_record");

            if($("#form-widgets-data_type").val() === 'XML') {
                controls.fadeIn();
            } else {
                controls.fadeOut();
            }
        });

        target = $("#form-widgets-data_definition");
        target.after('<div id="data_definition_grid"></div>');
        target_value = target.val();
        if (target_value.length === 0) {
            target_value = "[]";
        }
        try {
            data = $.parseJSON(target_value);
        } catch(err) {
            alert("Unable to parse Data Definition: " + err.message);
            return;
        }
        ddgrid = $("#data_definition_grid");
        ddgrid.jqxGrid({
            width: "100%",
            autoheight: true,
            columnsresize: true,
            editable: true,
            showtoolbar: true,
            rendertoolbar: function (toolbar) {
                var container,
                    addrowbutton,
                    deleterowbutton;

                    container = $("<div style='margin: 5px;'></div>");
                    toolbar.append(container);
                    container.append('<input id="addrowbutton" type="button" value="Add New Row" />');
                    container.append('<input style="margin-left: 5px;" id="deleterowbutton" type="button" value="Delete Selected Row" />');

                    addrowbutton = $("#addrowbutton");
                    addrowbutton.jqxButton();
                    addrowbutton.on('click', function () {
                        ddgrid.jqxGrid(
                            'addrow',
                            null,
                            {
                                name: '',
                                type: 'string',
                                mapping: ''
                            }
                        );
                    });

                    deleterowbutton = $("#deleterowbutton");
                    deleterowbutton.jqxButton();
                    deleterowbutton.on('click', function () {
                        var selectedrowindex = ddgrid.jqxGrid('getselectedrowindex'),
                            rowscount = ddgrid.jqxGrid('getdatainformation').rowscount;

                        if (selectedrowindex >= 0 && selectedrowindex < rowscount) {
                            var id = ddgrid.jqxGrid('getrowid', selectedrowindex),
                                commit = ddgrid.jqxGrid('deleterow', id);
                        }
                    });
                },
            source: new $.jqx.dataAdapter({
                datafields: [
                    {name: 'name', type: 'string'},
                    {name: 'type', type: 'string'},
                    {name: 'mapping', type: 'string'}
                    ],
                datatype: 'json',
                localdata: data,
                addrow: function (rowid, rowdata, position, commit) {
                    commit(true);
                    },
                deleterow: function (rowid, commit) {
                    commit(true);
                    updateDataDefinition();
                    }
                }),
            columns: [
                {text: 'Title', datafield: 'name', width: 250 },
                {text: 'Data Type', datafield: 'type', width: 250},
                {text: 'Mapping', datafield: 'mapping', width: 250 }
                ]
        });

        updateDataDefinition = function () {
            $("#form-widgets-data_definition")
                .text(ddgrid.jqxGrid('exportdata', 'json'));
        };
        ddgrid.on('cellvaluechanged', function (event) {
            updateDataDefinition();
        });
    }

});

