Ext.ns('Ext.ux.grid');
Ext.ux.grid.CheckboxGroupingView = Ext.extend(Ext.grid.GroupingView, {
    checkCls        : 'x-grid3-group-check',
    allCheckCls     : 'x-grid3-group-checked',
    someCheckCls    : 'x-grid3-group-checked-some',
    collapseOnCheck : false,
    //private
    stopToggle      : false,

    afterRender: function() {
        var me       = this,
            grid     = me.grid,
            selModel = grid.getSelectionModel();

        Ext.ux.grid.CheckboxGroupingView.superclass.afterRender.call(me);

        selModel.on('rowselect', me.handleGridRowSelect, me);
        selModel.on('rowdeselect', me.handleGridRowSelect, me);
        grid.on('beforedestroy', me.beforeDestroy, me);
    },

    beforeDestroy: function() {
        var me       = this,
            grid     = me.grid,
            selModel = grid.getSelectionModel();

        selModel.un('rowselect', me.handleGridRowSelect, me);
        selModel.un('rowdeselect', me.handleGridRowSelect, me);
    },

    processEvent: function(name, e) {
        var me        = this,
            el        = Ext.get(e.getTarget()),
            groupEl   = el.up('.x-grid-group'),
            checked   = el.hasClass(me.allCheckCls),
            clsAction = (checked ? 'remove' : 'add') + 'Class';

        Ext.grid.GroupingView.superclass.processEvent.call(me, name, e);

        var hd = e.getTarget('.x-grid-group-hd', me.mainBody);

        if (hd) {
            var field      = me.getGroupField(),
                prefix     = me.getPrefix(field),
                groupValue = hd.id.substring(prefix.length),
                emptyRe    = new RegExp('gp-' + Ext.escapeRe(field) + '--hd');
                groupValue = groupValue.substr(0, groupValue.length - 3);

            if (groupValue || emptyRe.test(hd.id)) {
                me.grid.fireEvent('group' + name, me.grid, field, groupValue, e);
            }
            if (name == 'mousedown' && e.button == 0) {
                if (el.hasClass(me.checkCls)) {
                    el[clsAction](me.allCheckCls);
                    me.toggleCheckGroupRecords(groupEl.id, !checked);

                    if (me.collapseOnCheck) {
                        me.toggleGroup(hd.parentNode, checked);
                    }
                } else {
                    me.toggleGroup(hd.parentNode);
                }
            }
        }
    },

    onBeforeRowSelect: function(sm, rowIndex) {
        var me = this;

        if (!me.stopToggle) {
            me.toggleRowIndex(rowIndex, true);
        }
    },

    getGroupRecords: function(groupId) {
        var me    = this,
            grid  = me.grid,
            store = grid.getStore(),
            recs  = [];

        store.each(function(rec) {
            if (rec._groupId === groupId) {
                recs.push(rec);
            }
        });

        return recs;
    },

    toggleCheckGroupRecords: function(groupId, check) {
        var me        = this,
            grid      = me.grid,
            store     = grid.getStore(),
            selModel  = grid.getSelectionModel(),
            selected  = selModel.getSelections(),
            groupRecs = me.getGroupRecords(groupId),
            recs      = [];

        if (check) {
            selected = selected.concat(groupRecs);
        } else {
            Ext.each(selected, function(rec, idx) {
                Ext.each(groupRecs, function(gRec) {
                    if (rec.id === gRec.id) {
                        delete selected[idx];
                    }
                });
            });
        }

        me.stopToggle = true;

        selModel.selectRecords(selected, false);

        me.stopToggle = false;
    },

    handleGridRowSelect: function(selModel, rowIdx, rec) {
        var me      = this,
            groupId = rec._groupId,
            groupEl = Ext.get(groupId),
            checkEl = groupEl.query('.' + me.checkCls),
            checkEl = Ext.get(checkEl[0]),
            recs    = me.getGroupRecords(groupId),
            len     = recs.length,
            check   = 0;

        Ext.iterate(recs, function(rec) {
            check += (selModel.isSelected(rec)) ? 1 : 0;
        });

        if (check === len) {
            checkEl.removeClass(me.someCheckCls);
            checkEl.addClass(me.allCheckCls);
        } else if (check === 0) {
            checkEl.removeClass(me.someCheckCls);
            checkEl.removeClass(me.allCheckCls);
        } else {
            checkEl.removeClass(me.allCheckCls);
            checkEl.addClass(me.someCheckCls);
        }
    }
});
