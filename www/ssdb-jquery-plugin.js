/**
 *	SequelSphereDB jQuery Plugin
 *
 *	This is a custom jQuery Plugin to allow close integration between
 *	jQuery and the SequelSphereDB engine.
 *
 *	@author		Matt Pierret
 *	@version	0.9
 *	@created	11/08/2012
 *	@license	Based on MIT License:
 *	
 *	Copyright (c) 2012 SequelSphere, LLC.
 *	
 *	Permission is hereby granted, free of charge, to any person obtaining
 *	a copy of this software file (the "Software"), to deal in the Software
 *	without restriction, including without limitation the rights to use,
 *	copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 *	of the Software, and to permit persons to whom the Software is furnished
 *	to do so, subject to the following conditions:
 *	
 *	This license applies to this file only, and not to any referencing software
 *	such as SequelSphereDB or any other required framework.
 *	
 *	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *	THE SOFTWARE.
 *	
 */
(function( $ ){
	
	// Plugin
	
	$.fn.sqlExec = function(options) {
		var opts = privateMethods._initOptions(options);
		var method = opts.op;
		if ( publicMethods[method] ) {
		  return publicMethods[method].apply(this, [opts]);
		} else {
			opts.error("Method " +  method + " does not exist on jQuery.sqlExec", opts);
		}    
	};

	// Public methods
	// All public methods are called only from the plugin
	// with 'this' set appropriately as if each method
	// were itself a plugin.
	
	var publicMethods = {
		
		query: function(options) {
			var opts = privateMethods._initQueryOptions(options);
			var results = null;
			try {
				results = db.query(opts.sql);
				return privateMethods._queryComplete(this, results, opts);
			}
			catch(err) {
				opts.error(err, opts);
			}
			return this;			
		},
		
		queryCursor: function(options) {
			var opts = privateMethods._initQueryOptions(options);
			var results = null;
			try {
				results = db.queryCursor(opts.sql);
				return privateMethods._queryComplete(this, results, opts);
			}
			catch(err) {
				opts.error(err, opts);
			}
			return this;
		},
		
		queryObjects: function(options) {
			var opts = privateMethods._initQueryOptions(options);
			var results = null;
			try {
				results = db.queryObjects(opts.sql);
				return privateMethods._queryComplete(this, results, opts);
			}
			catch(err) {
				opts.error(err, opts);
			}
			return this;
		},
		
		queryRow: function(options) {
			var opts = privateMethods._initQueryOptions(options);
			var results = null;
			try {
				results = db.queryRow(opts.sql);
				return privateMethods._queryComplete(this, results, opts);
			}
			catch(err) {
				opts.error(err, opts);
			}
			return this;
		},
		
		queryRowObject: function(options) {
			var opts = privateMethods._initQueryOptions(options);
			var results = null;
			try {
				results = db.queryRowObject(opts.sql);
				return privateMethods._queryComplete(this, results, opts);
			}
			catch(err) {
				opts.error(err, opts);
			}
			return this;
		},
		
		queryValue: function(options) {
			var opts = privateMethods._initQueryOptions(options);
			var results = null;
			try {
				results = db.queryValue(opts.sql);
				return privateMethods._queryComplete(this, results, opts);
			}
			catch(err) {
				opts.error(err, opts);
			}
			return this;
		},
			
		saveRow: function(options) {
			var opts = privateMethods._initSaveOptions(options);
			var affected = 0;
			if (opts.doInsert) {
				try {
					affected = opts.table.insertRow(opts.dataRow);
					opts.inserted = affected == 1;
					opts.doUpdate = opts.doUpdate && !opts.inserted;
					if (!opts.inserted && !opts.doUpdate) {
						errToReport = "On insert, " + affected + " rows affected; expected 1.";
					}
				}
				catch(err) {
					var errmsg = typeof err.getVerboseMessage === "function" ? err.getVerboseMessage() : (""+err);
					opts.doUpdate = opts.doUpdate && (errmsg.indexOf("Primary Key already exists") >= 0);
					if (!opts.doUpdate) {
						errToReport = err;
					}
				}
			}
					
			if (opts.doUpdate) {
				try {
					affected = opts.table.updateRow(opts.dataRow);
					opts.updated = affected == 1;
					errToReport = opts.updated ? null : "On update, " + affected + " rows affected; expected 1.";
				}
				catch(err) {
					errToReport = err;
				}
			}
			
			if (opts.inserted || opts.updated) {
				return this.each(function() {
					privateMethods._saveComplete($(this), opts);
				});
			}
			else {
				opts.eror(errToReport ? errToReport : "Unexpected error.", opts);
			}
			
			return this;
			
		},
		
		insertRow: function(options) {
			var opts = privateMethods._initSaveOptions(options);
			
			if (opts.doInsert) {
			
				try {
					var affected = opts.table.insertRow(opts.dataRow);	
					
					opts.inserted = affected == 1;
					return this.each(function() {
						privateMethods._saveComplete($(this), opts);
					});
				}
				catch(err) {
					opts.error(err, opts);
				}
			}
			return this;
		},
		
		updateRow: function(options) {
			var opts = privateMethods._initSaveOptions(options);
			
			if (opts.doUpdate) {
				try {
					var affected = opts.table.updateRow(opts.dataRow);
				
					opts.updated = affected == 1;
					return this.each(function() {
						privateMethods._saveComplete($(this), opts);
					});
				}
				catch(err) {
					opts.error(err, opts);
				}
			}
			return this;
		},
		
		deleteRow: function(options) {
			var opts = privateMethods._initSaveOptions(options);
			if (opts.doDelete) {
				try {
					var affected = opts.table.deleteRow(opts.dataRow);
					opts.deleted = affected == 1;
					return this.each(function() {
						privateMethods._saveComplete($(this), opts);
					});
				}
				catch(err) {
					opts.error(err, opts);
				}
			}
			return this;
		},
		
		commit: function(options) {
			try {
				db.commit();
				this.each(function() {
					$(this).trigger("commit", options);
				});
			}
			catch(err) {
				if (options.error) {
					options.error(err, options);
				}
			}
		},
		
		rollback: function(options) {
			try {
				db.rollback();
				this.each(function() {
					$(this).trigger("rollback", options);
				});
			}
			catch(err) {
				if (options.error) {
					options.error(err, options);
				}
			}
		}
			
	};
	
	var privateMethods = {
		
		_initOptions: function(options) {
			var opts = {};
			opts.op = typeof options.op === "string" ? options.op : "query";
			opts.sql = typeof options.sql === "string" ? options.sql : null;	
			opts.parameterizedSQL = typeof options.parameterizedSQL === "string" ? options.parameterizedSQL : null;	
			opts.args = typeof options.args !== "undefined" ? options.args : null;	
			opts.dataRow = typeof options.dataRow !== "undefined" ? options.dataRow : null;				
			opts.tableName = typeof options.tableName === "string" ? options.tableName : null;
			
			opts.dataKey = typeof options.dataKey === "string" ? options.dataKey : null;
			opts.bindData = typeof options.bindData === "boolean" ? options.bindData : 
				(opts.dataKey != null ? true : false);
			opts.dataKey = opts.bindData && opts.dataKey == null ? "results-data" : opts.dataKey;
				
			opts.eventKey = typeof options.eventKey === "string" ? options.eventKey : null;
			opts.triggerEvent = typeof options.triggerEvent === "boolean" ? options.triggerEvent :
				(typeof opts.eventKey === "string" ? true : false);
			opts.eventKey = opts.triggerEvent && opts.eventKey == null ? "query-complete" : opts.eventKey;			
			
			opts.success = typeof options.success === "function" ? options.success : null;
			opts.error= typeof options.error === "function" 
				? options.error 
				: (function(err, options) { 
					throw err;
				});
			
			return opts;
		},
			
		_initQueryOptions: function(options) {
			this._prepareSQL(options);	
			return options;
		},
		
		_initSaveOptions: function(options) {
			// Used to initialize options for one of the save operations (insert, update, delete)
			// A new copy of opts is not necesary.  Assumes _initOptions has already been called.
			var opts = options;
			
			opts.table = opts.tableName != null ? db.catalog.getTable(opts.tableName) : null;			
			opts.dataRow = privateMethods._rowToArray(opts.dataRow, opts.table);
			// Check to be sure we have something to do
			var hasPK = (opts.table != null) && (opts.table.pk != null) && (opts.table.pk.getColumnNames().length > 0);
			var canSave = opts.dataRow != null && opts.table != null;
			opts.doInsert = canSave && (opts.op === "insertRow" || opts.op === "saveRow");
			opts.doUpdate = canSave && (opts.op === "updateRow" || opts.op === "saveRow") && hasPK;
			opts.doDelete = opts.op === "deleteRow" && canSave;
			
			opts.inserted = false;
			opts.updated = false;
			opts.deleted = false;
			
			return opts;
		},
	
		_prepareSQL: function(options) {
			var sql = options.sql;
			if (typeof sql === "string") {
				return;
			}
			sql = typeof options.parameterizedSQL ? options.parameterizedSQL : "";
			var args = typeof options.args ? options.args : [];
			
			if (typeof args.length === "number") {
				for (var i = 0; i < args.length; i++) {
					var regexp = new RegExp('\\{'+i+'\\}', 'gi');
					sql = sql.replace(regexp, args[i]);
				}
			}
			else {
				for (var argName in args) {
					var arg = args[argName];
					var regexp = new RegExp('\\{'+argName+'\\}', 'gi');
					sql = sql.replace(regexp, arg);
				}
			}
			options.sql = sql;
		},
		
		_queryComplete: function(selected, results, options) {
			if (options.dataKey) {
				return selected.each(function() {
					$(this).data(options.dataKey, results);	
				});
			}
			
			if (options.triggerEvent) {
				return selected.each(function() {
					$(this).trigger(options.eventKey, results, options);
				});
			}
			
			if (options.success) {
				return selected.each(function() {
					options.success($(this), results, options);
				});
			}
			
			// If none of the other return options are specified, 
			// return the results directly.
			return results;
		},
		
		// Convert a row object to a row array.
		// If the dataRow is alreay an array, it is returned unchanged.
		// If the dataRow is not an array, it is converted to an
		// array containing column values in the table column order.
		// If the object does not have a matching property for
		// each column, nulls are returned for those columns.
		
		_rowToArray: function(dataRow, table) {
			if (dataRow == null)
				return dataRow;
			
			// If dataRow is an array, no conversion needed
			if (typeof dataRow.length !== "undefined")
				return dataRow;
			
			// dataRow is an object; try to convert it
			// to an array in the table column order
			var dataArr = [];
			for(var col in table.columns) {
				var dbcol = table.columns[col];
				var colName = dbcol.colName;
				var cellVal = typeof dataRow[col] === "undefined" ? dataRow[colName]: null;
				dataArr.push( cellVal );
			}
			return dataArr;
		},
		
		// Completion logic after each save
		
		_saveComplete: function(each, options) {		
			// NOTE: "this" is the selected object ($(this) in .each)
			
			if (options.inserted || options.updated || options.deleted) {
				if (options.bindData) {
					return each.data(options.dataKey, options.dataRow);
				}
				if (options.triggerEvent) {
					return each.trigger(options.eventKey, options);
				}
				if (options.success) {
					return options.success(each, options);
				}
			}
			else {
				each.error(errToReport);
			}
			return each;
		},
		
		debug: function(o, hdr) {
			var str = [];
			str.push(hdr);
			for(var p in o) {
				str.push (p + "=" + o[p]);
			}
			alert(str.join("\n"));
		}
	};
			
	
		
	
	
})( jQuery );


