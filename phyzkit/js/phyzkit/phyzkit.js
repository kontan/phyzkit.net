var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var Camera = (function () {
        function Camera(_scale, _point) {
            this._scale = _scale;
            this._point = _point;
            if(this._scale === undefined) {
                this._scale = 1;
            }
            if(this._point === undefined) {
                this._point = new M.b2Vec2(0, 0);
            }
        }
        Object.defineProperty(Camera.prototype, "scale", {
            get: function () {
                return this._scale;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "point", {
            get: function () {
                return this._point ? this._point.Copy() : new M.b2Vec2(0, 0);
            },
            enumerable: true,
            configurable: true
        });
        Camera.prototype.setScale = function (s) {
            return new Camera(s, this.point);
        };
        Camera.prototype.setPoint = function (p) {
            return new Camera(this.scale, p);
        };
        Camera.prototype.interpolate = function (ratio, camera) {
            return new Camera(this.scale + (camera.scale - this.scale) * ratio, new M.b2Vec2(this.point.x + (camera.point.x - this.point.x) * ratio, this.point.y + (camera.point.y - this.point.y) * ratio));
        };
        return Camera;
    })();
    Phyzkit.Camera = Camera;    
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var SANDBOX = (function () {
        function SANDBOX() { }
        SANDBOX.userDataDeserializerTable = {
        };
        SANDBOX.putUserDataDeserializer = function putUserDataDeserializer(type, callback) {
            if(SANDBOX.userDataDeserializerTable[type]) {
                console.log("WARNING: SANDBOX.putUserDataDeserializer: body userdata type overrided: " + type);
            }
            SANDBOX.userDataDeserializerTable[type] = callback;
        }
        SANDBOX.deserializeUserData = function deserializeUserData(data) {
            if(data) {
                var deserializer = SANDBOX.userDataDeserializerTable[data.type];
                if(deserializer) {
                    return deserializer(data);
                } else {
                    console.log("Sandbox.deserializeWorld: Unknown User Data Type: " + data.type);
                }
            } else {
                return undefined;
            }
        }
        return SANDBOX;
    })();
    Phyzkit.SANDBOX = SANDBOX;    
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    function showMenu(container, items, callback) {
        var inner = $("<div class=\"menu_inner_pane\" />");
        items.forEach(function (item) {
            inner.append(item);
        });
        var background = $("<div />");
        background.css("width", "100%");
        background.css("height", "100%");
        background.css("margin", "0px");
        background.css("display", "none");
        background.css("background-color", "rgba(0, 0, 0, 0.4)");
        background.css("position", "absolute");
        background.css("top", "0px");
        background.css("left", "0px");
        background.click(function () {
            menu.close();
        });
        background.append(inner);
        container.append(background);
        background.fadeIn("normal");
        var menu = {
            close: function () {
                background.fadeOut("normal", background.remove);
            }
        };
        return menu;
    }
    Phyzkit.showMenu = showMenu;
    ; ;
    function createMenuItem(label, click) {
        var div = $("<div class=\"menu_item\" />").text(label);
        if(click) {
            div.click(click);
        }
        return div;
    }
    Phyzkit.createMenuItem = createMenuItem;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var EditList = (function () {
        function EditList() {
            this.root = $("<div></div>");
            this.editList = [];
        }
        EditList.prototype.createEdit = function (type, label, onUpdate, onChange) {
            var input = $("<input type=\"" + type + "\"></input>").change(function () {
                onChange(input);
            });
            this.root.append($("<div class=\"edit_div_row\"/>").append($("<div style=\"float:left;\" class=\"edit_div_label\"/>").text(label), $("<div style=\"float:left;\" class=\"edit_div_input\"/>").append(input), $("<div style=\"clear:both;\" />")));
            return {
                input: input,
                update: function () {
                    if(input.get(0) !== $(":focus").get(0) && onUpdate) {
                        onUpdate(input);
                    }
                }
            };
        };
        EditList.prototype.createBooleanEdit = function (label, onUpdate, onChange) {
            var edit = this.createEdit("checkbox", label, function (input) {
                if(onUpdate()) {
                    if(input.attr("checked") === undefined) {
                        input.attr("checked", "checked");
                    }
                } else {
                    if(input.attr("checked")) {
                        input.removeAttr("checked");
                    }
                }
            }, function (input) {
                if(onChange) {
                    onChange(input.attr("checked") ? true : false);
                }
            });
            if(!onChange) {
                edit.input.attr("readonly", "readonly");
            }
            this.editList.push(edit);
            return edit;
        };
        EditList.prototype.createNumberEdit = function (label, step, onUpdate, onChange) {
            var edit = this.createEdit("number", label, function (input) {
                if(onUpdate() === undefined) {
                    console.log("hoge");
                }
                var value = onUpdate().toFixed(8).substr(0, 10);
                if(value === "-0.0000000") {
                    value = "0.00000000";
                }
                input.val(value);
            }, function (input) {
                if(onChange) {
                    onChange(parseFloat(input.val()));
                }
            });
            edit.input.attr("step", step.toString());
            if(!onChange) {
                edit.input.attr("readonly", "readonly");
            }
            this.editList.push(edit);
            return edit;
        };
        EditList.prototype.createEnumEdit = function (label, options, onUpdate, onChange) {
            function createOption(option) {
                var input = $("<input type=\"radio\"></input>").text(option.text).change(function () {
                    onChange(option.value);
                });
                return {
                    input: input,
                    content: $("<div></div>").append(input, option.text),
                    update: function (value) {
                        if(value === option.value) {
                            input.attr("checked", "checked");
                        } else {
                            input.removeAttr("checked");
                        }
                    }
                };
            }
            var optionList = [];
            var div_option = $("<div></div>");
            for(var i = 0; i < options.length; i++) {
                var option = createOption(options[i]);
                optionList.push(option);
                div_option.append(option.content);
            }
            this.root.append($("<div class=\"edit_div_row\"/>").append($("<div style=\"float:left;\" class=\"edit_div_label\"/>").text(label), $("<div style=\"float:left;\" class=\"edit_div_input\"/>").append(div_option), $("<div style=\"clear:both;\" />")));
            var edit = {
                input: undefined,
                update: function () {
                    var current = onUpdate();
                    optionList.forEach(function (op, i) {
                        op.update(current);
                    });
                }
            };
            this.editList.push(edit);
            return edit;
        };
        EditList.prototype.update = function () {
            this.editList.forEach(function (f) {
                f.update();
            });
        };
        return EditList;
    })();
    Phyzkit.EditList = EditList;    
    function createEditList() {
        return new EditList();
    }
    Phyzkit.createEditList = createEditList;
    ; ;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var ImageLoader = (function () {
        function ImageLoader() {
            this.images = [];
            this.loadedImages = [];
        }
        ImageLoader.create = function create() {
            return new ImageLoader();
        }
        Object.defineProperty(ImageLoader.prototype, "state", {
            get: function () {
                return this.images.length == 0 ? 1 : this.loadedImages.length / this.images.length;
            },
            enumerable: true,
            configurable: true
        });
        ImageLoader.prototype.request = function (url) {
            var _this = this;
            var onImageLoaded;
            var image = new Image();
            onImageLoaded = function (e) {
                _this.loadedImages.push(image);
                image.removeEventListener("load", onImageLoaded);
                if(_this.callback !== undefined && _this.loadedImages.length === _this.images.length) {
                    _this.callback();
                    _this.callback = undefined;
                }
            };
            image.addEventListener("load", onImageLoaded);
            (image).targetImageURL = url;
            this.images.push(image);
            return image;
        };
        ImageLoader.prototype.load = function (onComplete) {
            this.callback = onComplete;
            this.images.forEach(function (image) {
                var targetImageURL = (image).targetImageURL;
                if(image.src !== targetImageURL) {
                    image.src = targetImageURL;
                }
            });
        };
        ImageLoader.prototype.paint = function (canvas) {
            var g = canvas.getContext("2d");
            g.save();
            g.fillStyle = "black";
            g.fillRect(0, 0, canvas.width, canvas.height);
            g.strokeStyle = "white";
            g.fillStyle = "white";
            g.strokeRect(canvas.width * 0.4, canvas.height * 0.49, canvas.width * 0.2, canvas.height * 0.02);
            g.fillRect(canvas.width * 0.4, canvas.height * 0.49, canvas.width * 0.2 * this.state, canvas.height * 0.02);
            g.restore();
        };
        return ImageLoader;
    })();    
    Phyzkit.loader = new ImageLoader();
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    function pointFromEvent(e) {
        var offset = $(e.target).offset();
        var offsetX = e.pageX - offset.left;
        var offsetY = e.pageY - offset.top;

        return new M.b2Vec2(offsetX, offsetY);
    }
    Phyzkit.pointFromEvent = pointFromEvent;
    function getFixtureAt(world, point) {
        var result = null;
        world.QueryPoint(function (fixture) {
            result = fixture;
            return false;
        }, point);
        return result;
    }
    Phyzkit.getFixtureAt = getFixtureAt;
    function getBodyAt(world, point, callback) {
        world.QueryPoint(function (fixture) {
            callback(fixture.GetBody(), fixture);
            return false;
        }, point);
        return null;
    }
    function paddingLeft(length, text) {
        text = "" + text;
        while(length > text.length) {
            text = " " + text;
        }
        return text;
    }
    function formatNumber(n) {
        var s = n.toString();
        if(n === Math.floor(n)) {
            s += ".0";
        }
        if(s.charAt(0) !== "-") {
            s = "+" + s;
        }
        s = s.substr(0, 8);
        while(s.length < 8) {
            s = s + "0";
        }
        return s;
    }
    Phyzkit.formatNumber = formatNumber;
    function readParam(name, callback) {
        if(window.location.search.length > 0) {
            var params = window.location.search.substr(1).split("&");
            for(var i = 0; i < params.length; i++) {
                var tokens = params[i].split("=");
                if(tokens.length == 2 && tokens[0] === name) {
                    callback(decodeURIComponent(tokens[1]));
                    return;
                }
            }
            ; ;
        }
    }
    Phyzkit.readParam = readParam;
    function translateFixtures(sandbox, body, deltaInScreen) {
        for(var fixtureList = body.GetFixtureList(); fixtureList; fixtureList = fixtureList.GetNext()) {
            translateShape(sandbox, fixtureList.GetShape(), deltaInScreen);
        }
    }
    ; ;
    function translateShape(sandbox, shape, deltaInScreen) {
        if(shape instanceof S.b2PolygonShape) {
            var vertices = [];
            for(var i = 0; i < shape.GetVertexCount(); i++) {
                vertices.push(shape.GetVertices()[i].Copy());
            }
            vertices.forEach(function (v, i) {
                var sv = sandbox.viewport.toScreenCoords(v);
                sv.x += deltaInScreen.x;
                sv.y += deltaInScreen.y;
                vertices[i] = sandbox.viewport.toWorldCoords(sv);
            });
            shape.SetAsArray(vertices);
        } else {
            throw "Not implemented";
        }
    }
    ; ;
    function translateJointAnchor(sandbox, body, deltaInScreen) {
        for(var jointList = body.GetJointList(); jointList; jointList = jointList.next) {
            var jointEdge = jointList;
            var joint = jointEdge.joint;
            var isBodyA = joint.m_bodyA === body ? true : joint.m_bodyB === body ? false : undefined;
            if(isBodyA === undefined) {
                throw "INTERNAL ERROR";
            }
            var anchor = isBodyA ? joint.m_localAnchor1 : joint.m_localAnchor2;
            var anchorInScreen = sandbox.viewport.toScreenCoords(body.GetWorldPoint(anchor));
            var newAnchor = body.GetLocalPoint(sandbox.viewport.toWorldCoords(new M.b2Vec2(anchorInScreen.x + deltaInScreen.x, anchorInScreen.y + deltaInScreen.y)));
            if(isBodyA) {
                joint.m_localAnchor1 = newAnchor;
            } else {
                joint.m_localAnchor2 = newAnchor;
            }
        }
    }
    Phyzkit.translateJointAnchor = translateJointAnchor;
    function mergeBodies(base, ext) {
        for(var fixture = ext.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
            var def = new D.b2FixtureDef();
            def.density = fixture.GetDensity();
            def.friction = fixture.GetFriction();
            def.isSensor = fixture.IsSensor();
            def.restitution = fixture.GetRestitution();
            def.filter = fixture.GetFilterData().Copy();
            def.userData = (fixture.GetUserData() && fixture.GetUserData().copy) ? fixture.GetUserData().copy() : undefined;
            var shape = fixture.GetShape();
            if(shape instanceof S.b2PolygonShape) {
                var vs = [];
                for(var i = 0; i < shape.GetVertexCount(); i++) {
                    vs.push(base.GetLocalPoint(ext.GetWorldPoint(shape.GetVertices()[i])));
                }
                var polygon = new S.b2PolygonShape();
                polygon.SetAsArray([], vs.length);
                def.shape = polygon;
            } else {
                if(shape instanceof S.b2CircleShape) {
                    var circle = new S.b2CircleShape(shape.GetRadius());
                    circle.SetLocalPosition(base.GetLocalPoint(ext.GetWorldPoint(shape.GetLocalPosition().Copy())));
                    def.shape = circle;
                } else {
                    throw new TypeError();
                }
            }
            base.CreateFixture(def);
        }
        ext.GetWorld().DestroyBody(ext);
    }
    Phyzkit.mergeBodies = mergeBodies;
    var DropDownPanel = (function () {
        function DropDownPanel(title, updateFunc) {
            this.updateFunc = updateFunc;
            var _this = this;
            this.property_root = $("<div class=\"property_content\"></div>");
            this.property_title = $("<h5 class=\"property_title\"></h5>").text(title + "▼");
            this.clickToggle = $("<div class=\"property_dialog_inner\" />");
            this.property_root.append(this.property_title, this.clickToggle);
            this.property_title.click(function (e) {
                _this.toggle();
                e.stopPropagation();
            });
            this.sections = [];
        }
        Object.defineProperty(DropDownPanel.prototype, "body", {
            get: function () {
                if(this.sandbox.selectedBodies.length > 0) {
                    return this.sandbox.selectedBodies[this.sandbox.selectedBodies.length - 1];
                } else {
                    return undefined;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropDownPanel.prototype, "root", {
            get: function () {
                return this.property_root;
            },
            enumerable: true,
            configurable: true
        });
        DropDownPanel.prototype.toggle = function () {
            this.clickToggle.slideToggle();
        };
        DropDownPanel.prototype.update = function () {
            if(this.updateFunc) {
                this.sections.forEach(function (section) {
                    section.update();
                });
                this.updateFunc();
            }
        };
        DropDownPanel.prototype.createSection = function (visible) {
            var autoTogglePane = $("<div class=\"property_auto_toggle\" />");
            var contentPane = $("<div class=\"property_scrollpane\" />");
            this.clickToggle.append(autoTogglePane);
            autoTogglePane.append(contentPane);
            autoTogglePane.css("display", visible ? "block" : "none");
            var section = Object.create(null, {
                slideDown: {
                    value: function () {
                        autoTogglePane.slideDown();
                    }
                },
                slideUp: {
                    value: function () {
                        autoTogglePane.slideUp();
                    }
                },
                display: {
                    get: function () {
                        return autoTogglePane.css("display") !== "none";
                    }
                },
                createSubsection: {
                    value: function (title, content) {
                        var label = $("<h3 />").text(title);
                        var section = $("<div />");
                        contentPane.append(label, section);
                        label.click(function (e) {
                            section.slideToggle();
                            e.stopPropagation();
                        });
                        return section;
                    }
                }
            });
            this.sections.push({
                update: function () {
                    contentPane.css("max-height", ($(window).height() - 120) + "px");
                }
            });
            return section;
        };
        return DropDownPanel;
    })();
    Phyzkit.DropDownPanel = DropDownPanel;    
    function getBodyAABB(body) {
        var bl = +Number.MAX_VALUE;
        var br = -Number.MAX_VALUE;
        var bt = +Number.MAX_VALUE;
        var bb = -Number.MAX_VALUE;
        for(var fixtureList = body.GetFixtureList(); fixtureList; fixtureList = fixtureList.GetNext()) {
            var aabb = fixtureList.GetAABB();
            var lb = aabb.lowerBound;
            var ub = aabb.upperBound;
            bl = Math.min(bl, aabb.lowerBound.x);
            br = Math.max(br, aabb.upperBound.x);
            bt = Math.min(bt, aabb.lowerBound.y);
            bb = Math.max(bb, aabb.upperBound.y);
        }
        if(bl !== +Number.MAX_VALUE && br !== -Number.MAX_VALUE && bt !== +Number.MAX_VALUE && bb !== -Number.MAX_VALUE) {
            var aabb = new Box2D.Collision.b2AABB();
            aabb.lowerBound = new M.b2Vec2(bl, bt);
            aabb.upperBound = new M.b2Vec2(br, bb);
            return aabb;
        } else {
            return undefined;
        }
    }
    Phyzkit.getBodyAABB = getBodyAABB;
    var DropDownWindow = (function () {
        function DropDownWindow(title, autoToggleCondition, updateHandler) {
            this.title = title;
            this.autoToggleCondition = autoToggleCondition;
            this.updateHandler = updateHandler;
            var _this = this;
            this.property_root = $("<div class=\"property_content\"></div>");
            this.property_title = $("<h5 class=\"property_title\"></h5>");
            this.clickToggle = $("<div class=\"property_dialog_inner\" />");
            this.autoTogglePane = $("<div class=\"property_auto_toggle\" style=\"display:none;\" />");
            this.property_title.text(title + "▼").appendTo(this.property_root);
            this.clickToggle.appendTo(this.property_root);
            this.autoTogglePane.appendTo(this.clickToggle);
            this.property_title.click(function (e) {
                _this.clickToggle.slideToggle();
                e.stopPropagation();
            });
        }
        Object.defineProperty(DropDownWindow.prototype, "root", {
            get: function () {
                return this.property_root;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropDownWindow.prototype, "content", {
            get: function () {
                return this.autoTogglePane;
            },
            enumerable: true,
            configurable: true
        });
        DropDownWindow.prototype.update = function () {
            var toggle = this.autoToggleCondition();
            var display = this.autoTogglePane.css("display") !== "none";
            if(toggle && !display) {
                this.autoTogglePane.slideUp();
            } else {
                if(!toggle && display) {
                    this.autoTogglePane.slideDown();
                }
            }
            if(this.currentEditor) {
                this.currentEditor.update();
            }
            if(this.updateHandler) {
                this.updateHandler();
            }
        };
        DropDownWindow.prototype.setEditor = function (editor) {
            this.currentEditor = editor;
        };
        return DropDownWindow;
    })();
    Phyzkit.DropDownWindow = DropDownWindow;    
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    function createJointRow(sandbox, joint, parent) {
        var div = $("<div class=\"object_list_item\"></div>");
        parent.append(div);
        div.click(function (e) {
            var ctrlKey = (e).ctrlKey;
            if(ctrlKey) {
                sandbox.toggleObjectSelection(joint);
            } else {
                sandbox.selectOneObject(joint);
            }
            e.stopPropagation();
        });
        function update() {
            var type = joint instanceof Box2D.Dynamics.Joints.b2DistanceJoint ? "Distance" : joint instanceof Box2D.Dynamics.Joints.b2FrictionJoint ? "Friction" : joint instanceof Box2D.Dynamics.Joints.b2GearJoint ? "Gear" : joint instanceof Box2D.Dynamics.Joints.b2LineJoint ? "Line" : joint instanceof Box2D.Dynamics.Joints.b2MouseJoint ? "MouseJoint" : joint instanceof Box2D.Dynamics.Joints.b2PrismaticJoint ? "Prismatic" : joint instanceof Box2D.Dynamics.Joints.b2PulleyJoint ? "Pulley" : joint instanceof Box2D.Dynamics.Joints.b2RevoluteJoint ? "Revolute" : joint instanceof Box2D.Dynamics.Joints.b2WeldJoint ? "Weld" : "UNKNOWN";
            var typeLabel = "★" + type;
            if(div.text() !== typeLabel) {
                div.text(typeLabel);
            }
            if(sandbox.isSelected(joint)) {
                div.addClass("object_selected");
            } else {
                div.removeClass("object_selected");
            }
        }
        update();
        return {
            object: joint,
            update: update
        };
    }
    function createFixtureRow(sandbox, fixture, parent) {
        var div = $("<div class=\"object_list_item object_fixture\"></div>");
        parent.append(div);
        div.click(function (e) {
            var ctrlKey = (e).ctrlKey;
            if(ctrlKey) {
                sandbox.toggleObjectSelection(fixture);
            } else {
                sandbox.selectOneObject(fixture);
            }
            e.stopPropagation();
        });
        function update() {
            var userData = fixture.GetUserData();
            var name = userData && userData.name ? userData.name : "(名前なし)";
            if(div.text() !== name) {
                div.text(name);
            }
            if(fixture.GetShape() instanceof S.b2PolygonShape) {
                div.addClass("shape_polygon");
                div.removeClass("shape_circle");
            } else {
                if(fixture.GetShape() instanceof S.b2CircleShape) {
                    div.addClass("shape_circle");
                    div.removeClass("shape_polygon");
                } else {
                    div.removeClass("shape_circle");
                    div.removeClass("shape_polygon");
                }
            }
            if(sandbox.isSelected(fixture)) {
                div.addClass("object_selected");
            } else {
                div.removeClass("object_selected");
            }
        }
        update();
        return {
            object: fixture,
            update: update
        };
    }
    function createBodyInfoCell(sandbox, bodyIndex, body, parent) {
        var userData = body.GetUserData();
        var name = userData && userData.name ? userData.name : "(名前なし)";
        var tracking = $("<input type=\"checkbox\" />");
        var div_num = $("<div style=\"float:left;\" />").text("[" + bodyIndex + "]");
        var div_name = $("<div style=\"float:left;\" class=\"object_list_name\"  />").text(name);
        var div_expand = $("<div style=\"float:left;\" class=\"object_list_name\">▲</div>");
        var div_clear = $("<div style=\"clear:both;\" />");
        var div_body = $("<div />").append(div_expand, div_num, div_name, div_clear);
        var div_fixtures = $("<div style=\"padding-left:40px;\" />");
        var tr = $("<div class=\"object_list_row\" />").append(div_body, div_fixtures);
        var childInfo = [];
        function updateBodyRow() {
            if((function () {
                if(div_fixtures.css("display") === "none") {
                    return false;
                }
                var index = 0;
                for(var fixtureList = body.GetFixtureList(); fixtureList; fixtureList = fixtureList.GetNext() , index++) {
                    if(index >= childInfo.length || fixtureList !== childInfo[index].object) {
                        return true;
                    }
                }
                for(var jointList = body.GetJointList(); jointList; jointList = jointList.next , index++) {
                    if(index >= childInfo.length || jointList.joint !== childInfo[index].object) {
                        return true;
                    }
                }
                if(index != childInfo.length) {
                    return true;
                }
                return false;
            })()) {
                childInfo = [];
                div_fixtures.children().remove();
                for(var fixtureList = body.GetFixtureList(); fixtureList; fixtureList = fixtureList.GetNext()) {
                    childInfo.push(createFixtureRow(sandbox, fixtureList, div_fixtures));
                }
                for(var jointEdge = body.GetJointList(); jointEdge; jointEdge = jointEdge.next) {
                    childInfo.push(createJointRow(sandbox, jointEdge.joint, div_fixtures));
                }
            }
            childInfo.forEach(function (frow) {
                frow.update();
            });
            var userData = body.GetUserData();
            var name = userData && userData.name ? userData.name : "(名前なし)";
            if(div_name.text() !== name) {
                div_name.text(name);
            }
            if(sandbox.isSelected(body)) {
                div_body.addClass("object_selected");
            } else {
                div_body.removeClass("object_selected");
            }
        }
        div_expand.click(function () {
            div_fixtures.slideToggle("normal", function () {
                div_expand.text(div_fixtures.css("display") === "none" ? "▼" : "▲");
            });
        });
        tr.mouseover(function (e) {
            sandbox.clearPseudoSelection();
            sandbox.pseudoSelectBody(body);
            e.stopPropagation();
        });
        tr.click(function (e) {
            var ctrlKey = (e).ctrlKey;
            if(ctrlKey) {
                sandbox.toggleObjectSelection(body);
            } else {
                sandbox.selectOneObject(body);
            }
        });
        tr.dblclick(function () {
            var viewport = sandbox.viewport;
            viewport.pointEasing(body.GetPosition());
            var aabb = Phyzkit.getBodyAABB(body);
            if(aabb) {
                var size = Math.max(aabb.upperBound.x - aabb.lowerBound.x, aabb.upperBound.y - aabb.lowerBound.y);
                var view = Math.min(viewport.canvas.width(), viewport.canvas.height());
                var scale = 0.4 * view / size;
                viewport.cameraEasing = viewport.cameraEasing.setScale(scale);
            }
        });
        parent.prepend(tr);
        updateBodyRow();
        return {
            body: body,
            update: updateBodyRow
        };
    }
    function createObjectListDialog() {
        var currentBodies = [];
        var currentJoints = [];

        function checkUpdate(array, bodies) {
            if(array.length !== bodies.length) {
                return true;
            }
            for(var i = 0; i < bodies.length; i++) {
                if(bodies[i] !== array[i].body) {
                    return true;
                }
            }
            return false;
        }
        var panel = new Phyzkit.DropDownPanel("オブジェクト", function () {
            var sandbox = panel.sandbox;
            var viewport = sandbox.viewport;
            var canvas = viewport.canvas;
            var world = panel.sandbox.world;
            var bodies = [];
            var viewportAABB = new C.b2AABB();
            viewportAABB.lowerBound = viewport.toWorldCoords(new M.b2Vec2(0, canvas.height()));
            viewportAABB.upperBound = viewport.toWorldCoords(new M.b2Vec2(canvas.width(), 0));
            world.QueryAABB(function (fixture) {
                var body = fixture.GetBody();
                if(bodies.indexOf(body) < 0) {
                    bodies.push(body);
                }
                return true;
            }, viewportAABB);
            if(checkUpdate(currentBodies, bodies)) {
                bodyContentPane.children().remove();
                currentBodies = [];
                for(var i = 0; i < bodies.length; i++) {
                    currentBodies.push(createBodyInfoCell(sandbox, world.GetBodyCount() - 1 - i, bodies[i], bodyContentPane));
                }
            }
            currentBodies.forEach(function (bodyInfo) {
                bodyInfo.update();
            });
        });
        var section = panel.createSection(true);
        var optionSection = section.createSubsection("オプション");
        optionSection.append("<input type=\"checkbox\"></input>ビューポート内");
        var bodySection = section.createSubsection("ボディ");
        var bodyContentPane = $("<div class=\"object_list_tbody\" />").appendTo(bodySection);
        return panel;
    }
    Phyzkit.createObjectListDialog = createObjectListDialog;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    var TYPE_JOINT_REVOLUTE = "phyzkit_joint_revolute";
    function serializeRevolveJoint(revolve) {
    }
    Phyzkit.serializeRevolveJoint = serializeRevolveJoint;
    function serializeJoint(joint) {
        if(joint instanceof Box2D.Dynamics.Joints.b2RevoluteJoint) {
            var m_joint = joint;
            return {
                type: TYPE_JOINT_REVOLUTE,
                bodyA: "hogehoge",
                bodyB: "hogehoge",
                localAnchorA: m_joint.m_localAnchor1.Copy(),
                localAnchorB: m_joint.m_localAnchor2.Copy(),
                referenceAngle: m_joint.m_referenceAngle,
                impulse: m_joint.m_impulse.Copy(),
                motorImpulse: m_joint.m_motorImpulse,
                lowerAngle: m_joint.m_lowerAngle,
                upperAngle: m_joint.m_upperAngle,
                maxMotorTorque: m_joint.m_maxMotorTorque,
                motorSpeed: m_joint.m_motorSpeed,
                enableLimit: m_joint.m_enableLimit,
                enableMotor: m_joint.m_enableMotor,
                limitState: m_joint.m_limitState
            };
        }
    }
    Phyzkit.serializeJoint = serializeJoint;
    function serializeFixture(fixture) {
        var fixtureDef = {
            shape: {
            }
        };
        if(fixture.GetDensity() !== 0) {
            fixtureDef.density = fixture.GetDensity();
        }
        fixtureDef.filterData = fixture.GetFilterData();
        if(fixture.GetFriction() !== 0) {
            fixtureDef.friction = fixture.GetFriction();
        }
        if(fixture.IsSensor() !== false) {
            fixtureDef.sensor = fixture.IsSensor();
        }
        if(fixture.GetRestitution() !== 0) {
            fixtureDef.restitution = fixture.GetRestitution();
        }
        if(fixture.GetUserData() && fixture.GetUserData().serialize) {
            fixtureDef.userData = fixture.GetUserData().serialize(fixture);
        } else {
        }
        var shape = fixture.GetShape();
        if(shape instanceof S.b2CircleShape) {
            var circle = shape;
            fixtureDef.shape.type = "b2CircleShape";
            fixtureDef.shape.pos = circle.GetLocalPosition();
            fixtureDef.shape.radius = circle.GetRadius();
        } else {
            if(shape instanceof S.b2PolygonShape) {
                var polygon = shape;
                fixtureDef.shape.type = "b2PolygonShape";
                fixtureDef.shape.vertices = polygon.GetVertices();
            } else {
                var error = new Error();
                error.name = "Internal Error";
                error.message = "Box2DViewer.serialize: Unsupported fixture type.";
                throw error;
            }
        }
        return fixtureDef;
    }
    Phyzkit.serializeFixture = serializeFixture;
    function serializeBody(body) {
        var def = body.GetDefinition();
        var massData = new S.b2MassData();
        body.GetMassData(massData);
        def.massData = {
            center: massData.center,
            I: massData.I,
            mass: massData.mass
        };
        if(def.userData && def.userData.serialize) {
            def.userData = def.userData.serialize();
        } else {
        }
        def.fixtures = [];
        for(var fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
            def.fixtures.push(serializeFixture(fixture));
        }
        return def;
    }
    Phyzkit.serializeBody = serializeBody;
    function deserializeAndCreateBody(world, bodyDef, userDataDeserializer) {
        if(!userDataDeserializer) {
            userDataDeserializer = Phyzkit.SANDBOX.deserializeUserData;
        }
        var body = world.CreateBody(bodyDef);
        body.SetUserData(userDataDeserializer(bodyDef.userData));
        bodyDef.fixtures.forEach(function (fixtureDef) {
            var filter = new D.b2FilterData();
            filter.categoryBits = fixtureDef.filterData.categoryBits;
            filter.groupIndex = fixtureDef.filterData.groupIndex;
            filter.maskBits = fixtureDef.filterData.maskBits;
            var def = new D.b2FixtureDef();
            def.density = fixtureDef.density;
            def.filter = filter;
            def.friction = fixtureDef.friction;
            def.isSensor = fixtureDef.isSensor;
            def.restitution = fixtureDef.restitution;
            def.userData = userDataDeserializer(fixtureDef.userData);
            if(fixtureDef.shape.type == "b2CircleShape") {
                var circle = new S.b2CircleShape(fixtureDef.shape.radius);
                circle.SetLocalPosition(fixtureDef.shape.pos);
                def.shape = circle;
            } else {
                if(fixtureDef.shape.type == "b2PolygonShape") {
                    var polygon = new S.b2PolygonShape();
                    polygon.SetAsArray(fixtureDef.shape.vertices, fixtureDef.shape.vertices.length);
                    def.shape = polygon;
                } else {
                    throw new Error("deserializeAndCreateBody: unknown shape type.");
                }
            }
            body.CreateFixture(def);
        });
        if(bodyDef.massData) {
            var massData = new S.b2MassData();
            massData.center.x = bodyDef.massData.center.x;
            massData.center.y = bodyDef.massData.center.y;
            massData.I = bodyDef.massData.I;
            massData.mass = bodyDef.massData.mass;
            body.SetMassData(massData);
        }
        return body;
    }
    Phyzkit.deserializeAndCreateBody = deserializeAndCreateBody;
    function serializeWorld(world) {
        var bodies = [];
        for(var body = world.GetBodyList(); body && body.GetNext; body = body.GetNext()) {
            bodies.push(serializeBody(body));
        }
        var joints = [];
        for(var joint = world.GetJointList(); joint; joint = joint.GetNext()) {
            joints.push(serializeJoint(joint));
        }
        return {
            gravity: world.GetGravity(),
            bodies: bodies,
            joints: joints,
            warmStarting: world.m_warmStarting,
            continuousPhysics: world.m_continuousPhysics
        };
    }
    Phyzkit.serializeWorld = serializeWorld;
    function deserializeWorld(data, userDataDeserializer) {
        if(!userDataDeserializer) {
            userDataDeserializer = Phyzkit.SANDBOX.deserializeUserData;
        }
        var world = new D.b2World(data.gravity ? data.gravity : new M.b2Vec2(0, 0), true);
        if(data.bodies) {
            data.bodies.forEach(function (bodyDef) {
                deserializeAndCreateBody(world, bodyDef, userDataDeserializer);
            });
        }
        return world;
    }
    Phyzkit.deserializeWorld = deserializeWorld;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    function createGridBackground(red, green, blue) {
        if(red === undefined) {
            red = 0;
        }
        if(green === undefined) {
            green = 0;
        }
        if(blue === undefined) {
            blue = 0;
        }
        return {
            paint: function (g, viewport) {
                var tl = viewport.toWorldCoords(new M.b2Vec2(0, 0));
                var br = viewport.toWorldCoords(new M.b2Vec2(viewport.canvas.width(), viewport.canvas.height()));
                var lines = 0;
                for(var i = -5; i <= 5; i++) {
                    var v = Math.LOG10E * Math.log(viewport.camera.scale);
                    var t = 0.5 * Math.min(1, Math.max(0, 1 - 0.8 * Math.abs(v + i - 2)));
                    if(t > 0) {
                        var s = Math.pow(10, i);
                        g.beginPath();
                        for(var x = Math.ceil(tl.x / s) * s; x < br.x; x += s) {
                            var p = viewport.toScreenCoords(new M.b2Vec2(x, 0));
                            g.moveTo(p.x, 0);
                            g.lineTo(p.x, 10000);
                            lines++;
                        }
                        for(var y = Math.floor(tl.y / s) * s; y >= br.y; y -= s) {
                            var p = viewport.toScreenCoords(new M.b2Vec2(0, y));
                            g.moveTo(0, p.y);
                            g.lineTo(10000, p.y);
                            lines++;
                        }
                        var color = "rgba(" + red + ", " + green + ", " + blue + ", " + t.toFixed(4) + ")";
                        g.lineWidth = 1;
                        g.strokeStyle = color;
                        g.stroke();
                    }
                }
            }
        };
    }
    Phyzkit.createGridBackground = createGridBackground;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    function createSimpleBackground(fillStyle) {
        return {
            paint: function (g, viewport) {
                g.fillStyle = fillStyle;
                g.fillRect(0, 0, viewport.canvas.width(), viewport.canvas.height());
            }
        };
    }
    Phyzkit.createSimpleBackground = createSimpleBackground;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    function createLayeredBackground(backgroundList) {
        return {
            paint: function (g, viewport) {
                backgroundList.forEach(function (background) {
                    g.save();
                    background.paint(g, viewport);
                    g.restore();
                });
            }
        };
    }
    Phyzkit.createLayeredBackground = createLayeredBackground;
    ; ;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    function createFixedImageBackground(image) {
        return {
            paint: function (g, viewport) {
                var imageAspectRatio = image.width / image.height;
                var viewportAspectRatio = viewport.canvas.width() / viewport.canvas.height();
                var s = Math.max(imageAspectRatio, viewportAspectRatio);
                g.drawImage(image, 0, 0);
            }
        };
    }
    ; ;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    function forEachBody(world, callback) {
        var body;
        var userData;

        for(body = world.GetBodyList(); body; body = body.GetNext()) {
            userData = body.GetUserData();
            callback(body, userData);
        }
    }
    var Viewport = (function () {
        function Viewport(_canvas, viewport) {
            this._canvas = _canvas;
            var _this = this;
            this.background = Phyzkit.createGridBackground();
            this.foreground = undefined;
            this.mouseDraggable = true;
            this.camera = new Phyzkit.Camera(100);
            this.cameraEasing = new Phyzkit.Camera(100);
            this.dom = this.canvas.get(0);
            this.graphics = this.dom.getContext("2d");
            this.canvas.mousemove(function (e) {
                if(_this.mouseDraggable) {
                    _this.mousePosition = Phyzkit.pointFromEvent(e);
                    if(_this.dragStartPosition && _this.vrpOnDragStart) {
                        _this.point(new M.b2Vec2((_this.vrpOnDragStart.x - (_this.mousePosition.x - _this.dragStartPosition.x) / _this.camera.scale), (_this.vrpOnDragStart.y - (_this.mousePosition.y - _this.dragStartPosition.y) / -_this.camera.scale)));
                        e.preventDefault();
                    }
                }
            });
            this.canvas.mouseout(function (e) {
                _this.mousePosition = undefined;
                _this.mouseDownPosition = undefined;
            });
            this.canvas.mousedown(function (e) {
                var button = (e).button;
                if(_this.mouseDraggable && (button == 2)) {
                    _this.dragStartPosition = _this.mouseDownPosition = Phyzkit.pointFromEvent(e);
                    _this.vrpOnDragStart = _this.camera.point.Copy();
                }
            });
            this.canvas.mouseup(function (e) {
                _this.dragStartPosition = _this.mouseDownPosition = undefined;
                _this.vrpOnDragStart = undefined;
            });
            var processWheel = function (e) {
                if(_this.mouseDraggable) {
                    var p = Phyzkit.pointFromEvent(e);
                    _this.scaleEasing(e.detail ? e.detail * -0.1 : e.wheelDelta ? e.wheelDelta * 0.001 : 0);
                    e.preventDefault();
                }
            };
            this.canvas.get(0).addEventListener("DOMMouseScroll", processWheel);
            this.canvas.get(0).addEventListener("mousewheel", processWheel);
        }
        Viewport.MAX_SCALE = 10000;
        Viewport.MIN_SCALE = 1;
        Object.defineProperty(Viewport.prototype, "canvas", {
            get: function () {
                return this._canvas;
            },
            enumerable: true,
            configurable: true
        });
        Viewport.prototype.point = function (p) {
            this.camera = this.camera.setPoint(p);
            this.cameraEasing = this.camera;
        };
        Viewport.prototype.pointEasing = function (p) {
            this.cameraEasing = this.cameraEasing.setPoint(p);
        };
        Viewport.prototype.scale = function (delta) {
            this.camera = this.camera.setScale(Math.max(Viewport.MIN_SCALE, Math.min(Viewport.MAX_SCALE, this.camera.scale * Math.pow(2, delta))));
            this.cameraEasing = this.camera;
        };
        Viewport.prototype.scaleEasing = function (delta) {
            this.cameraEasing = this.cameraEasing.setScale(Math.max(Viewport.MIN_SCALE, Math.min(Viewport.MAX_SCALE, this.cameraEasing.scale * Math.pow(2, delta))));
        };
        Viewport.prototype.toWorldCoords = function (pointInScreenCoords) {
            return new M.b2Vec2((pointInScreenCoords.x - this.dom.width / 2) / this.camera.scale + this.camera.point.x, (pointInScreenCoords.y - this.dom.height / 2) / (-this.camera.scale) + this.camera.point.y);
        };
        Viewport.prototype.toScreenCoords = function (pointInWorld) {
            return new M.b2Vec2((pointInWorld.x - this.camera.point.x) * this.camera.scale + this.dom.width / 2, (pointInWorld.y - this.camera.point.y) * (-this.camera.scale) + this.dom.height / 2);
        };
        Viewport.prototype.update = function () {
            this.camera = this.camera.interpolate(0.2, this.cameraEasing);
            this.mouseDownPosition = undefined;
        };
        Viewport.prototype.paint = function (world) {
            var _this = this;
            var canvas = this.canvas.get(0);
            var pos;

            if(this.background) {
                this.graphics.save();
                this.background.paint(this.graphics, this);
                this.graphics.restore();
            }
            var canvas = this.canvas.get(0);
            this.graphics.save();
            this.graphics.translate(canvas.width / 2, canvas.height / 2);
            this.graphics.scale(this.camera.scale, -this.camera.scale);
            this.graphics.translate(-this.camera.point.x, -this.camera.point.y);
            forEachBody(world, function (body, userData) {
                var pos = body.GetPosition();
                _this.graphics.save();
                _this.graphics.translate(pos.x, pos.y);
                _this.graphics.rotate(body.GetAngle());
                var paintTargetList = [];
                if(userData && userData.paint) {
                    _this.graphics.save();
                    userData.paint(_this.graphics, body);
                    _this.graphics.restore();
                } else {
                    for(var fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
                        var fixtureUserData = fixture.GetUserData();
                        if(fixtureUserData && fixtureUserData.paint) {
                            paintTargetList.push({
                                func: fixtureUserData.paint,
                                order: fixtureUserData.zOrder,
                                args: [
                                    _this.graphics, 
                                    fixture
                                ]
                            });
                        }
                    }
                }
                paintTargetList.sort(function (a, b) {
                    return (a.zOrder && b.zOrder) ? a.zOrder - b.zOrder : (a.zOrder ? 1 : b.zOrder);
                });
                paintTargetList.forEach(function (target) {
                    _this.graphics.save();
                    target.func.apply(window, target.args);
                    _this.graphics.restore();
                });
                _this.graphics.restore();
            });
            this.graphics.restore();
            forEachBody(world, function (body, userData) {
                var pos = body.GetPosition();
                _this.graphics.save();
                if(userData && userData.paintScreen) {
                    userData.paintScreen(_this, _this.graphics, body);
                } else {
                    for(var fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
                        var fixtureUserData = fixture.GetUserData();
                        if(fixtureUserData && fixtureUserData.paintScreen) {
                            fixtureUserData.paintScreen(_this, _this.graphics, fixture);
                        }
                    }
                }
                _this.graphics.restore();
            });
            for(var joint = world.GetJointList(); joint; joint = joint.GetNext()) {
                var userData = joint.GetUserData();
                if(userData && userData.paintScreen) {
                    this.graphics.save();
                    userData.paintScreen(this.graphics, this);
                    this.graphics.restore();
                }
            }
            if(this.foreground) {
                this.graphics.save();
                this.foreground(this.graphics, this);
                this.graphics.restore();
            }
        };
        Viewport.prototype.paintBodyState = function (body, aabbcolor) {
            if(!body) {
                throw new TypeError();
            }
            if(!aabbcolor) {
                aabbcolor = "rgba(0, 127, 127, 0.6)";
            }
            var bl = +Number.MAX_VALUE;
            var br = -Number.MAX_VALUE;
            var bt = +Number.MAX_VALUE;
            var bb = -Number.MAX_VALUE;
            var bodyAABB = Phyzkit.getBodyAABB(body);
            if(bodyAABB) {
                var body_lb = this.toScreenCoords(bodyAABB.lowerBound);
                var body_ub = this.toScreenCoords(bodyAABB.upperBound);
                var bodyAABBLineWidth = 4;
                this.graphics.lineWidth = bodyAABBLineWidth;
                this.graphics.strokeStyle = aabbcolor;
                this.graphics.strokeRect(body_lb.x - bodyAABBLineWidth / 2, body_ub.y - bodyAABBLineWidth / 2, body_ub.x - body_lb.x + bodyAABBLineWidth, body_lb.y - body_ub.y + bodyAABBLineWidth);
            }
            var position = this.toScreenCoords(body.GetPosition());
            var velocity = body.GetLinearVelocity().Copy();
            velocity.Multiply(this.camera.scale * 0.1);
            this.graphics.beginPath();
            this.graphics.moveTo(position.x, position.y);
            this.graphics.lineTo(position.x + velocity.x, position.y - velocity.y);
            this.graphics.strokeStyle = "rgba(0, 255, 0, 0.6)";
            this.graphics.stroke();
            var angularVelocity = body.GetAngularVelocity();
            this.graphics.beginPath();
            this.graphics.moveTo(position.x, position.y);
            for(var i = 0; i < Math.abs(angularVelocity) * 10; i++) {
                var a = angularVelocity > 0 ? i : -i;
                var r = 0.2;
                var s = 0.2;
                var x = position.x + r * i * Math.cos(a * s);
                var y = position.y + r * i * Math.sin(a * s);
                this.graphics.lineTo(x, y);
            }
            this.graphics.strokeStyle = "rgba(0, 0, 255, 0.6)";
            this.graphics.stroke();
            var com = this.toScreenCoords(body.GetWorldPoint(body.GetLocalCenter()));
            this.graphics.beginPath();
            this.graphics.moveTo(com.x - 6, com.y - 6);
            this.graphics.lineTo(com.x + 6, com.y + 6);
            this.graphics.moveTo(com.x + 6, com.y - 6);
            this.graphics.lineTo(com.x - 6, com.y + 6);
            this.graphics.lineWidth = 4;
            this.graphics.strokeStyle = "rgba(64, 120, 0, 0.8)";
            this.graphics.stroke();
            var pos = this.toScreenCoords(body.GetPosition());
            this.graphics.beginPath();
            this.graphics.moveTo(pos.x - 6, pos.y - 6);
            this.graphics.lineTo(pos.x + 6, pos.y + 6);
            this.graphics.moveTo(pos.x + 6, pos.y - 6);
            this.graphics.lineTo(pos.x - 6, pos.y + 6);
            this.graphics.lineWidth = 4;
            this.graphics.strokeStyle = "rgba(255, 64, 64, 0.5)";
            this.graphics.stroke();
        };
        Viewport.prototype.paintFixtureInfo = function (fixture, aabbcolor) {
            var body = fixture.GetBody();
            var shape = fixture.GetShape();
            if(shape instanceof S.b2PolygonShape) {
                var polygon = shape;
                var vs = polygon.GetVertices();
                this.graphics.beginPath();
                for(var i = 0; i < polygon.GetVertexCount(); i++) {
                    var v = this.toScreenCoords(body.GetWorldPoint(vs[i]));
                    this.graphics.lineTo(v.x, v.y);
                }
                this.graphics.closePath();
                this.graphics.lineWidth = 6;
                this.graphics.strokeStyle = "rgba(0, 0, 0, 0.2)";
                this.graphics.stroke();
                this.graphics.lineWidth = 4;
                this.graphics.strokeStyle = aabbcolor;
                this.graphics.stroke();
            } else {
                if(shape instanceof S.b2CircleShape) {
                    var circle = shape;
                    var center = this.toScreenCoords(body.GetWorldPoint(circle.GetLocalPosition()));
                    this.graphics.beginPath();
                    this.graphics.arc(center.x, center.y, circle.GetRadius() * this.camera.scale, 0, 8, true);
                    this.graphics.closePath();
                    this.graphics.lineWidth = 6;
                    this.graphics.strokeStyle = "rgba(0, 0, 0, 0.2)";
                    this.graphics.stroke();
                    this.graphics.lineWidth = 4;
                    this.graphics.strokeStyle = aabbcolor;
                    this.graphics.stroke();
                }
            }
        };
        return Viewport;
    })();
    Phyzkit.Viewport = Viewport;    
    function createViewport(canvas, viewport) {
        return new Viewport(canvas, viewport);
    }
    Phyzkit.createViewport = createViewport;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    function showSettingDialog(container) {
        var b2Settings = Box2D.Common.b2Settings;
        var tbody = $("<tbody class=\"setting_tbody\" />");
        var table = $("<table class=\"setting_table\" />").append(tbody);
        var div = $("<div class=\"setting_div\"></div>").append(table);
        var close = $("<div class=\"button\">閉じる</div>");
        var background = $("<div class=\"dialog_background\"><h3>Box2D 詳細設定</h3></div>").append(div, close);
        var settings = [];
        function setting(label, getter, setter) {
            var input = $("<input type=\"number\" class=\"setting_number\" />");
            tbody.append($("<tr />").append($("<td/>").append(label), $("<td />").append(input)));
            input.change(function () {
                setter(parseFloat(input.val()));
            });
            settings.push(function () {
                input.val(getter().toString());
            });
        }
        function update() {
            settings.forEach(function (setting) {
                setting();
            });
        }
        background.click(function () {
            background.fadeOut("normal");
        });
        table.click(function (e) {
            e.stopPropagation();
        });
        setting("aabbExtension", function () {
            return b2Settings.b2_aabbExtension;
        }, function (v) {
            b2Settings.b2_aabbExtension = v;
        });
        setting("aabbMultiplier", function () {
            return b2Settings.b2_aabbMultiplier;
        }, function (v) {
            b2Settings.b2_aabbMultiplier = v;
        });
        setting("angularSleepTolerance", function () {
            return b2Settings.b2_angularSleepTolerance;
        }, function (v) {
            b2Settings.b2_angularSleepTolerance = v;
        });
        setting("angularSlop", function () {
            return b2Settings.b2_angularSlop;
        }, function (v) {
            b2Settings.b2_angularSlop = v;
        });
        setting("contactBaumgarte", function () {
            return b2Settings.b2_contactBaumgarte;
        }, function (v) {
            b2Settings.b2_contactBaumgarte = v;
        });
        setting("linearSleepTolerance", function () {
            return b2Settings.b2_linearSleepTolerance;
        }, function (v) {
            b2Settings.b2_linearSleepTolerance = v;
        });
        setting("linearSlop", function () {
            return b2Settings.b2_linearSlop;
        }, function (v) {
            b2Settings.b2_linearSlop = v;
        });
        setting("maxAngularCorrection", function () {
            return b2Settings.b2_maxAngularCorrection;
        }, function (v) {
            b2Settings.b2_maxAngularCorrection = v;
        });
        setting("maxLinearCorrection ", function () {
            return b2Settings.b2_maxLinearCorrection;
        }, function (v) {
            b2Settings.b2_maxLinearCorrection = v;
        });
        setting("maxManifoldPoints ", function () {
            return b2Settings.b2_maxManifoldPoints;
        }, function (v) {
            b2Settings.b2_maxManifoldPoints = v;
        });
        setting("maxRotation", function () {
            return b2Settings.b2_maxRotation;
        }, function (v) {
            b2Settings.b2_maxRotation = v;
        });
        setting("maxRotationSquared", function () {
            return b2Settings.b2_maxRotationSquared;
        }, function (v) {
            b2Settings.b2_maxRotationSquared = v;
        });
        setting("maxTOIContactsPerIsland", function () {
            return b2Settings.b2_maxTOIContactsPerIsland;
        }, function (v) {
            b2Settings.b2_maxTOIContactsPerIsland = v;
        });
        setting("maxTOIJointsPerIsland", function () {
            return b2Settings.b2_maxTOIJointsPerIsland;
        }, function (v) {
            b2Settings.b2_maxTOIJointsPerIsland = v;
        });
        setting("maxTranslation", function () {
            return b2Settings.b2_maxTranslation;
        }, function (v) {
            b2Settings.b2_maxTranslation = v;
        });
        setting("maxTranslationSquared", function () {
            return b2Settings.b2_maxTranslationSquared;
        }, function (v) {
            b2Settings.b2_maxTranslationSquared = v;
        });
        setting("pi ", function () {
            return b2Settings.b2_pi;
        }, function (v) {
            b2Settings.b2_pi = v;
        });
        setting("polygonRadius", function () {
            return b2Settings.b2_polygonRadius;
        }, function (v) {
            b2Settings.b2_polygonRadius = v;
        });
        setting("timeToSleep", function () {
            return b2Settings.b2_timeToSleep;
        }, function (v) {
            b2Settings.b2_timeToSleep = v;
        });
        setting("toiSlop", function () {
            return b2Settings.b2_toiSlop;
        }, function (v) {
            b2Settings.b2_toiSlop = v;
        });
        setting("velocityThreshold", function () {
            return b2Settings.b2_velocityThreshold;
        }, function (v) {
            b2Settings.b2_velocityThreshold = v;
        });
        update();
        container.append(background);
        background.fadeIn("normal");
    }
    Phyzkit.showSettingDialog = showSettingDialog;
    ; ;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    function createScriptPad(container) {
        var background = $("<div class=\"dialog_background\" />");
        var textarea = $("<textarea class=\"textarea_script_pad\" wrap=\"off\" />");
        var output = $("<textarea class=\"textarea_script_console\" />");
        var close = $("<div class=\"tool_button button\">閉じる</div>").click(function () {
            background.fadeOut("normal", function () {
                background.remove();
            });
        });
        var execute = $("<div class=\"tool_button button\">実行</div>").click(function () {
            var script = textarea.val();
            try  {
                var result = eval(script);
                console.log(result);
                if(result) {
                    output.val(result + "\n");
                }
                return true;
            } catch (err) {
                console.log(err);
                output.val(err + "\n");
                return false;
            }
        });
        var exe_close = $("<div class=\"tool_button button\">実行＆閉じる</div>").click(function () {
            execute.triggerHandler("click");
            close.triggerHandler("click");
        });
        var erase = $("<div class=\"tool_button button\">消去</div>").click(function () {
            textarea.val("");
        });
        background.append(textarea, output, close, execute, exe_close, erase);
        container.append(background);
        background.fadeIn("normal");
    }
    Phyzkit.createScriptPad = createScriptPad;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    function createTextViewDialog(container, text, callback) {
        var textarea = $("<textarea wrap=\"soft\" style=\"overflow:scroll; width:100%; height: 100%;\"/>").val(text);
        var textarea_div = $("<div class=\"serialized_world_textarea \"></div>").append(textarea);
        var close = $("<div class=\"tool_button button serialized_world_textarea_close\">閉じる</div>").click(function () {
            background.fadeOut("normal", function () {
                background.remove();
                callback(textarea.text());
            });
        });
        var background = $("<div class=\"dialog_background\" />").append(textarea_div, close);
        container.append(background);
        background.fadeIn("normal");
    }
    Phyzkit.createTextViewDialog = createTextViewDialog;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    function showControllerDialog(container, sandbox) {
        var tbody = $("<tbody class=\"setting_tbody\" />");
        var table = $("<table class=\"setting_table\" />").append(tbody);
        var div = $("<div class=\"setting_div\"></div>").append(table);
        var close = $("<div class=\"button\">閉じる</div>");
        var background = $("<div class=\"dialog_background\"><h3>Box2D 詳細設定</h3></div>").append(div, close);
        function control(index, controller) {
            var type = controller instanceof Box2D.Dynamics.Controllers.b2BuoyancyController ? "Buoyancy" : controller instanceof Box2D.Dynamics.Controllers.b2ConstantAccelController ? "ConstantAccel" : controller instanceof Box2D.Dynamics.Controllers.b2ConstantForceController ? "ConstantForce" : controller instanceof Box2D.Dynamics.Controllers.b2GravityController ? "Gravity" : ("UNKNOWN: " + controller.constructor);
            var input = $("<input type=\"number\" class=\"setting_number\" />");
            tbody.append($("<tr />").append($("<td/>").append("[" + index + "]"), $("<td />").append(type)));
        }
        function update(sandbox) {
            for(var controller = sandbox.world.m_controllerList, i = 0; controller; controller = controller.GetNext() , i++) {
                control(i, controller);
            }
        }
        background.click(function () {
            background.fadeOut("normal");
        });
        table.click(function (e) {
            e.stopPropagation();
        });
        update(sandbox);
        container.append(background);
        background.fadeIn("normal");
    }
    Phyzkit.showControllerDialog = showControllerDialog;
    ; ;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    var WorldDeserializeDialog = (function () {
        function WorldDeserializeDialog(container, sandbox) {
            this.container = container;
            var _this = this;
            var inner = $('<div class="menu_inner_pane" />');
            inner.css("top", "20px");
            inner.css("left", "20px");
            inner.css("bottom", "20px");
            inner.css("right", "20px");
            inner.css("position", "absolute");
            inner.css("max-width", "none");
            inner.click(function (event) {
                event.stopPropagation();
            });
            var listPane = $('<div />');
            listPane.css("position", "absolute");
            listPane.css("top", "12px");
            listPane.css("left", "12px");
            listPane.css("right", "12px");
            listPane.css("bottom", "50px");
            listPane.css("border", "solid 1px rgba(255,255,255,0.4)");
            listPane.css("overflow", "auto");
            inner.append(listPane);
            var buttonBox = $('<div/>');
            buttonBox.css("position", "absolute");
            buttonBox.css("height", "25px");
            buttonBox.css("left", "12px");
            buttonBox.css("right", "12px");
            buttonBox.css("bottom", "12px");
            inner.append(buttonBox);
            sandbox.saveDataList.forEach(function (item) {
                var img = $('<img class="button" border="0" />');
                img.attr("src", item.dataURL);
                img.attr("width", "120");
                img.attr("height", "80");
                img.css("width", "90px");
                img.css("height", "30px");
                img.click(function () {
                    sandbox.loadWorldFromText(item.serializedWorld);
                    _this.close();
                });
                listPane.append(img);
            });
            var loadButton = $('<div class="button" style="width:4em;height:12px;float:left;">Load</div>');
            buttonBox.append(loadButton);
            var closeButton = $('<div class="button" style="width:4em;height:12px;float:left;">Cancel</div>');
            buttonBox.append(closeButton);
            var deleteButton = $('<div class="button" style="width:4em;height:12px;float:left;">Delete</div>');
            buttonBox.append(deleteButton);
            this.background = $("<div />");
            this.background.css("width", "100%");
            this.background.css("height", "100%");
            this.background.css("margin", "0px");
            this.background.css("display", "none");
            this.background.css("background-color", "rgba(0, 0, 0, 0.4)");
            this.background.css("position", "absolute");
            this.background.css("top", "0px");
            this.background.css("left", "0px");
            this.background.click(function () {
                _this.close();
            });
            this.background.append(inner);
            container.append(this.background);
            this.background.fadeIn("normal");
        }
        WorldDeserializeDialog.prototype.close = function () {
            var _this = this;
            this.background.fadeOut("normal", function () {
                _this.background.remove();
            });
        };
        return WorldDeserializeDialog;
    })();
    Phyzkit.WorldDeserializeDialog = WorldDeserializeDialog;    
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    var SerializedWorld = (function () {
        function SerializedWorld(world, viewport) {
            var canvas = viewport.canvas.get(0);
            this.screenShot = canvas.toDataURL();
            this.serializedData = JSON.stringify(Phyzkit.serializeWorld(world));
            this._date = new Date();
        }
        Object.defineProperty(SerializedWorld.prototype, "dataURL", {
            get: function () {
                return this.screenShot;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SerializedWorld.prototype, "date", {
            get: function () {
                return new Date(this._date.getTime());
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SerializedWorld.prototype, "serializedWorld", {
            get: function () {
                return this.serializedData;
            },
            enumerable: true,
            configurable: true
        });
        return SerializedWorld;
    })();
    Phyzkit.SerializedWorld = SerializedWorld;    
    var SandBox = (function () {
        function SandBox() {
            var _this = this;
            this.jq_canvas = $("<canvas style=\"position:absolute; top:0px; left:0px; width:100%; height:100%; display:block; -moz-user-select:none; -webkit-user-select:none;\" />");
            this.jq_menubar = $("<div class=\"sandbox_menubar\" />");
            this.jq_statusbar = $("<div class=\"status_bar\">Box2D Sandbox 0.001</div>");
            this.jq_dialogLayer = $("<div></div>");
            this.saveDataList = [];
            this.objectListPanel = Phyzkit.createObjectListDialog();
            this.dialogStack = [];
            this._pseudoSelectedBodies = [];
            this._selectedObjects = [];
            this.world = new D.b2World(new M.b2Vec2(0, -10), true);
            this.frameRate = 60;
            this.isWorldActive = true;
            this.clipboard = [];
            this.jq_root = $("<div class=\"sandbox_container\" />").append(this.jq_canvas, this.jq_menubar, this.jq_statusbar, this.jq_dialogLayer);
            this.elem_canvas = this.jq_canvas.get(0);
            this.graphics = this.elem_canvas.getContext("2d");
            this.viewport = Phyzkit.createViewport(this.jq_canvas);
            this.container = this.jq_root;
            this.objectListPanel.sandbox = this;
            this.container.append(this.objectListPanel.root);
            this.objectListPanel.root.css("right", "auto");
            this.objectListPanel.root.css("left", "2px");
            this.objectEditor = Phyzkit.createObjectEditor(this);
            this.container.append(this.objectEditor.root);
            this.initializeWorld();
            this.jq_canvas.click(function (e) {
                if(_this.currentTool && _this.currentTool.click) {
                    _this.currentTool.click(e, _this);
                }
            });
            this.jq_canvas.mousedown(function (e) {
                if(_this.currentTool && _this.currentTool.mousedown) {
                    _this.currentTool.mousedown(e, _this);
                }
            });
            this.jq_canvas.mousemove(function (e) {
                if(_this.currentTool && _this.currentTool.mousemove) {
                    _this.currentTool.mousemove(e, _this);
                }
            });
            this.jq_canvas.mouseup(function (e) {
                if(_this.currentTool && _this.currentTool.mouseup) {
                    _this.currentTool.mouseup(e, _this);
                }
            });
            this.jq_canvas.mouseout(function (e) {
                if(_this.currentTool && _this.currentTool.mouseout) {
                    _this.currentTool.mouseout(e, _this);
                }
            });
            $(window).keydown(function (e) {
                if(_this.currentTool && _this.currentTool.keydown) {
                    _this.currentTool.keydown(e, _this);
                }
            });
            var menu_button = $("<div class=\"button icon_button menu_button\" />");
            menu_button.mousemove(function () {
                _this.showStatus("メニュー：メニューを開きます");
            });
            this.jq_menubar.append(menu_button);
            menu_button.click(function () {
                Phyzkit.showMenu(_this.jq_root, [
                    Phyzkit.createMenuItem("選択した物体の切り取り", function () {
                        _this.clipboard.splice(0, _this.clipboard.length);
                        _this.selectedBodies.forEach(function (body) {
                            _this.clipboard.push(Phyzkit.serializeBody(body));
                            body.GetWorld().DestroyBody(body);
                        });
                        _this.clearSelection();
                    }), 
                    Phyzkit.createMenuItem("選択した物体のコピー", function () {
                        _this.clipboard.splice(0, _this.clipboard.length);
                        _this.selectedBodies.forEach(function (body) {
                            _this.clipboard.push(Phyzkit.serializeBody(body));
                        });
                    }), 
                    Phyzkit.createMenuItem("クリップボードから貼り付け", function () {
                        _this.clipboard.forEach(function (data) {
                            var body = Phyzkit.deserializeAndCreateBody(this.world, data);
                            body.SetAwake(true);
                            body.SetActive(true);
                        });
                    }), 
                    Phyzkit.createMenuItem("選択した物体の削除", function () {
                        _this.selectedBodies.forEach(function (body) {
                            body.GetWorld().DestroyBody(body);
                        });
                        _this.clearSelection();
                    }), 
                    Phyzkit.createMenuItem("選択したフィクスチャの削除", function () {
                        _this.selectedFixtures.forEach(function (fixture) {
                            fixture.GetBody().DestroyFixture(fixture);
                        });
                        _this.clearSelection();
                    }), 
                    Phyzkit.createMenuItem("選択した物体のマージ", function () {
                        if(_this.selectedBodies.length >= 2) {
                            var base = _this.selectedBodies[0];
                            for(var i = 1; i < _this.selectedBodies.length; i++) {
                                Phyzkit.mergeBodies(base, _this.selectedBodies[i]);
                            }
                            _this.clearSelection();
                            _this.selectObject(base);
                        }
                    }), 
                    Phyzkit.createMenuItem("選択したオブジェクトを回転ジョイントで接続", function () {
                        function connect(bodyA, bodyB) {
                            var posA = bodyA.GetPosition();
                            var posB = bodyB.GetPosition();
                            var anchor = new M.b2Vec2((posA.x + posB.x) / 2, (posA.y + posB.y) / 2);
                            var def = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
                            def.bodyA = bodyA;
                            def.bodyB = bodyB;
                            def.localAnchorA = bodyA.GetLocalPoint(anchor).Copy();
                            def.localAnchorB = bodyB.GetLocalPoint(anchor).Copy();
                            def.referenceAngle = bodyB.GetAngle() - bodyA.GetAngle();
                            var joint = bodyA.GetWorld().CreateJoint(def);
                            joint.SetUserData({
                                paintScreen: function (g, viewport) {
                                    function drawAnchor(label, point) {
                                        var p = viewport.toScreenCoords(point);
                                        var s = 10;
                                        g.lineWidth = 4;
                                        g.strokeStyle = "black";
                                        g.beginPath();
                                        g.moveTo(p.x - s, p.y - s);
                                        g.lineTo(p.x + s, p.y + s);
                                        g.moveTo(p.x + s, p.y - s);
                                        g.lineTo(p.x - s, p.y + s);
                                        g.stroke();
                                        g.fillStyle = "black";
                                        g.fillText(label, p.x + 5, p.y + 20);
                                    }
                                    var pa = viewport.toScreenCoords(bodyA.GetPosition());
                                    var aa = viewport.toScreenCoords(joint.GetAnchorA());
                                    var ab = viewport.toScreenCoords(joint.GetAnchorB());
                                    var pb = viewport.toScreenCoords(bodyB.GetPosition());
                                    g.beginPath();
                                    g.moveTo(pa.x, pa.y);
                                    g.lineTo(aa.x, aa.y);
                                    g.lineTo(ab.x, ab.y);
                                    g.lineTo(pb.x, pb.y);
                                    g.lineWidth = 4;
                                    g.strokeStyle = "black";
                                    g.stroke();
                                    g.beginPath();
                                    g.arc(pa.x, pa.y, 4, 0, 7);
                                    g.arc(aa.x, aa.y, 4, 0, 7);
                                    g.arc(ab.x, ab.y, 4, 0, 7);
                                    g.arc(pb.x, pb.y, 4, 0, 7);
                                    g.fillStyle = "red";
                                    g.fill();
                                }
                            });
                        }
                        var bodies = _this.selectedBodies;
                        if(bodies.length >= 2) {
                            for(var i = 0; i < bodies.length - 1; i++) {
                                connect(bodies[i], bodies[i + 1]);
                            }
                        }
                    }), 
                    Phyzkit.createMenuItem("ワールドの初期化", function () {
                        _this.initializeWorld();
                        _this.showStatus("ワールドを初期化しました。");
                    }), 
                    Phyzkit.createMenuItem("ワールドの読み込み >", function () {
                        new Phyzkit.WorldDeserializeDialog(_this.jq_root, _this);
                    }), 
                    Phyzkit.createMenuItem("ワールドの保存", function () {
                        _this.saveWorld();
                        _this.showStatus("ワールドを保存しました。");
                    }), 
                    Phyzkit.createMenuItem("スクリプト >", function () {
                        Phyzkit.createScriptPad(_this.jq_dialogLayer);
                    }), 
                    Phyzkit.createMenuItem("データ閲覧 >", function () {
                        var savedWorld = Phyzkit.serializeWorld(_this.world);
                        Phyzkit.createTextViewDialog(_this.jq_dialogLayer, JSON.stringify(savedWorld), function () {
                        });
                    }), 
                    (function () {
                        var anchor = $('<a class="menu_item" href="" target="_blank" style="text-decoration:none; display:block;">スクリーンショット</a>');
                        anchor.css("width", "300px");
                        anchor.css("height", "300px");
                        anchor.click(function (e) {
                            anchor.get(0).href = _this.elem_canvas.toDataURL();
                            _this.showStatus("スクリーンショットを撮影しました。");
                        });
                        return anchor;
                    })(), 
                    Phyzkit.createMenuItem("視点の初期化", function () {
                        _this.viewport.cameraEasing = new Phyzkit.Camera();
                        _this.showStatus("初期視点に戻ります。初期状態では 1 Box2DLength == 100px, 注視点が (0, 0) です。。");
                    }), 
                    Phyzkit.createMenuItem("ツールの編集 >"), 
                    Phyzkit.createMenuItem("Box2D 詳細設定", function () {
                        Phyzkit.showSettingDialog(_this.container);
                    })
                ]);
            });
            (function () {
                var world_activity_button = $("<canvas class=\"button icon_button \" />");
                var angle = 0;
                var g = world_activity_button.get(0).getContext("2d");
                _this.jq_menubar.append(world_activity_button);
                setInterval(function () {
                    world_activity_button.get(0).width = world_activity_button.width();
                    world_activity_button.get(0).height = world_activity_button.height();
                    g.translate(12, 12);
                    g.rotate(angle);
                    g.translate(-12, -12);
                    g.fillStyle = "lightgrey";
                    g.fillRect(4, 4, 16, 16);
                    if(_this.isWorldActive) {
                        angle += 0.1;
                    }
                }, 50);
                world_activity_button.click(function (e) {
                    _this.isWorldActive = !_this.isWorldActive;
                });
                world_activity_button.mousemove(function () {
                    _this.showStatus("時間：ワールド時間の進行/停止の切り替え　現在:" + (_this.isWorldActive ? "進行中" : "停止中"));
                });
            })();
            (this.jq_canvas).contextmenu(function (e) {
                e.preventDefault();
            });
            this.jq_canvas.mousemove(function (e) {
                var p = _this.viewport.toWorldCoords(Phyzkit.pointFromEvent(e));
                _this.showStatus("(x,y) = (" + Phyzkit.formatNumber(p.x) + ", " + Phyzkit.formatNumber(p.y) + ")");
                _this.clearPseudoSelection();
            });
            this.addToolButton(Phyzkit.createSelectionTool());
            this.addToolButton(Phyzkit.createHandTool());
            this.addToolButton(Phyzkit.createMovingTool(this));
        }
        SandBox.prototype.showStatus = function (text) {
            this.jq_statusbar.text(text);
        };
        SandBox.prototype.selectObject = function (obj) {
            if(!obj) {
                throw new TypeError();
            }
            var index = this._selectedObjects.indexOf(obj);
            if(index < 0) {
                this._selectedObjects.push(obj);
            }
        };
        SandBox.prototype.isSelected = function (obj) {
            return this._selectedObjects.indexOf(obj) >= 0;
        };
        SandBox.prototype.clearSelection = function () {
            this._selectedObjects.splice(0, this._selectedObjects.length);
            this.clearPseudoSelection();
        };
        SandBox.prototype.selectOneObject = function (obj) {
            this.clearSelection();
            this.selectObject(obj);
        };
        SandBox.prototype.toggleObjectSelection = function (obj) {
            var index = this._selectedObjects.indexOf(obj);
            if(index < 0) {
                this.selectObject(obj);
            } else {
                this._selectedObjects.splice(index, 1);
            }
        };
        Object.defineProperty(SandBox.prototype, "selectedObjects", {
            get: function () {
                return this._selectedObjects.slice(0);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SandBox.prototype, "selectedBodies", {
            get: function () {
                return this._selectedObjects.filter(function (o) {
                    return o instanceof D.b2Body;
                });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SandBox.prototype, "selectedFixtures", {
            get: function () {
                return this._selectedObjects.filter(function (o) {
                    return o instanceof D.b2Fixture;
                });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SandBox.prototype, "selectedJoints", {
            get: function () {
                return this._selectedObjects.filter(function (o) {
                    return o instanceof Box2D.Dynamics.Joints.b2Joint;
                });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SandBox.prototype, "pseudoSelectedBodies", {
            get: function () {
                return this._pseudoSelectedBodies.slice(0);
            },
            enumerable: true,
            configurable: true
        });
        SandBox.prototype.pseudoSelectBody = function (body) {
            var index = this._pseudoSelectedBodies.indexOf(body);
            if(index < 0) {
                this._pseudoSelectedBodies.push(body);
            }
        };
        SandBox.prototype.clearPseudoSelection = function () {
            this._pseudoSelectedBodies.splice(0, this._pseudoSelectedBodies.length);
        };
        SandBox.prototype.pushDialog = function (dialog) {
            this.dialogStack.push(dialog);
        };
        SandBox.prototype.popDialog = function () {
            var _this = this;
            if(this.dialogStack.length > 0) {
                var dialog = this.dialogStack[this.dialogStack.length - 1];
                dialog.close(function () {
                    _this.dialogStack.pop();
                });
            }
        };
        SandBox.prototype.initializeWorld = function () {
            this.world = new D.b2World(new M.b2Vec2(0, -10), true);
            this.clearSelection();
        };
        SandBox.prototype.saveWorld = function () {
            this.saveDataList.push(new SerializedWorld(this.world, this.viewport));
        };
        SandBox.prototype.loadWorld = function () {
            this.clearSelection();
        };
        SandBox.prototype.update = function () {
            if(this.elem_canvas.width !== this.jq_canvas.width()) {
                this.elem_canvas.width = this.jq_canvas.width();
            }
            if(this.elem_canvas.height !== this.jq_canvas.height()) {
                this.elem_canvas.height = this.jq_canvas.height();
            }
            this.viewport.update();
            this._selectedObjects = this._selectedObjects.filter(function (o) {
                if(o instanceof Box2D.Dynamics.Joints.b2Joint) {
                    if(o.m_bodyA && o.m_bodyB) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return true;
            });
            if(this.isWorldActive) {
                this.world.Step(1 / this.frameRate, 10, 10);
                this.world.ClearForces();
                this.objectListPanel.update();
                this.objectEditor.update();
            }
        };
        SandBox.prototype.paint = function () {
            var _this = this;
            if(Phyzkit.loader.state < 1) {
                Phyzkit.loader.paint(this.elem_canvas);
            } else {
                this.viewport.paint(this.world);
                if(this._pseudoSelectedBodies.length > 0) {
                    this._pseudoSelectedBodies.forEach(function (body) {
                        _this.viewport.paintBodyState(body, "rgba(127, 127, 0, 0.6)");
                    });
                } else {
                    this.selectedBodies.forEach(function (body) {
                        _this.viewport.paintBodyState(body);
                    });
                    this.selectedFixtures.forEach(function (fixture) {
                        _this.viewport.paintFixtureInfo(fixture, "rgba(255, 0, 0, 0.6)");
                    });
                }
                if(this.currentTool) {
                    if(this.currentTool.paint) {
                        this.graphics.save();
                        this.currentTool.paint(this.graphics, this.viewport, this);
                        this.graphics.restore();
                    }
                    if(this.currentTool.paintWorld) {
                        this.graphics.save();
                        this.currentTool.paintWorld(this.graphics);
                        this.graphics.restore();
                    }
                }
                this.dialogStack.forEach(function (dialog) {
                    if(dialog.paint) {
                        _this.graphics.save();
                        dialog.paint(_this.graphics);
                        _this.graphics.restore();
                    }
                });
            }
        };
        SandBox.prototype.start = function () {
            var _this = this;
            Phyzkit.loader.load();
            var loop = function () {
                _this.update();
                _this.paint();
                setTimeout(loop, 1000 / _this.frameRate);
            };
            loop();
        };
        SandBox.prototype.loadWorldFromJSON = function (json) {
            this.world = Phyzkit.deserializeWorld(json);
            this.clearSelection();
        };
        SandBox.prototype.loadWorldFromText = function (text) {
            this.loadWorldFromJSON(JSON.parse(text));
        };
        SandBox.prototype.loadScriptFromText = function (script) {
            try  {
                var func = new Function("sandbox", script);
                var result = func(this);
                if(result) {
                    console.log(result);
                }
                return true;
            } catch (err) {
                console.log(err);
                return false;
            }
        };
        SandBox.prototype.loadScriptFromURL = function (url, scope) {
            var _this = this;
            jQuery.ajax(url, {
                type: "GET",
                url: url,
                dataType: "text",
                success: function (data, dataType) {
                    _this.loadScriptFromText(data);
                }
            });
        };
        SandBox.prototype.loadWorldFromURL = function (url, callback) {
            var _this = this;
            jQuery.ajax(url, {
                type: "GET",
                url: url,
                dataType: "json",
                success: function (data, dataType) {
                    _this.loadWorldFromJSON(data);
                    if(callback) {
                        callback();
                    }
                }
            });
        };
        SandBox.prototype.addToolButton = function (tool) {
            var _this = this;
            var button = $("<div class=\"action_button tool icon_button button\"></div>");
            if(tool.toolButtonStyle) {
                button.addClass(tool.toolButtonStyle);
            }
            button.click(function () {
                if(_this.currentTool && _this.currentTool.unselect) {
                    _this.currentTool.unselect(_this);
                }
                _this.currentTool = tool;
                if(_this.currentTool && _this.currentTool.select) {
                    _this.currentTool.select(_this);
                }
                _this.showStatus("ツールを選択");
                $(".tool").removeClass("tool_active");
                button.addClass("tool_active");
            });
            this.jq_menubar.append(button);
            button.mouseover(function () {
                _this.showStatus(tool.tooltip);
            });
            var toolButtons = this.jq_menubar.find(".tool");
            if(toolButtons.length == 1) {
                toolButtons.triggerHandler("click");
            }
        };
        return SandBox;
    })();
    Phyzkit.SandBox = SandBox;    
    function createSandBox() {
        return new SandBox();
    }
    Phyzkit.createSandBox = createSandBox;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    function createFixtureEditor(sandbox, fixture) {
        function update() {
            editList.update();
        }
        var editList = Phyzkit.createEditList();
        editList.createNumberEdit("密度", 0.1, function () {
            return fixture.GetDensity();
        }, function (v) {
            fixture.SetDensity(v);
        });
        editList.createNumberEdit("摩擦係数", 0.1, function () {
            return fixture.GetFriction();
        }, function (v) {
            fixture.SetFriction(v);
        });
        editList.createNumberEdit("反発係数", 0.1, function () {
            return fixture.GetRestitution();
        }, function (v) {
            fixture.SetRestitution(v);
        });
        editList.createNumberEdit("カテゴリ", 0.1, function () {
            return fixture.GetFilterData().categoryBits;
        }, function (v) {
            var d = fixture.GetFilterData().Copy();
            d.categoryBits = v;
            fixture.SetFilterData(d);
        });
        editList.createNumberEdit("グループ", 0.1, function () {
            return fixture.GetFilterData().groupIndex;
        }, function (v) {
            var d = fixture.GetFilterData().Copy();
            d.groupIndex = v;
            fixture.SetFilterData(d);
        });
        editList.createNumberEdit("マスク", 0.1, function () {
            return fixture.GetFilterData().maskBits;
        }, function (v) {
            var d = fixture.GetFilterData().Copy();
            d.maskBits = v;
            fixture.SetFilterData(d);
        });
        editList.createBooleanEdit("センサ", function () {
            return fixture.IsSensor();
        }, function (v) {
            fixture.SetSensor();
        });
        return {
            object: fixture,
            control: editList.root,
            update: update
        };
    }
    Phyzkit.createFixtureEditor = createFixtureEditor;
    ; ;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    function createRevoluteJointEditor(sandbox, revoluteJoint) {
        function update() {
            editList.update();
        }
        var editList = Phyzkit.createEditList();
        editList.createBooleanEdit("角度の制限", function () {
            return revoluteJoint.IsLimitEnabled();
        }, function (v) {
            revoluteJoint.EnableLimit(v);
        });
        editList.createNumberEdit("最小角度", 0.1, function () {
            return revoluteJoint.GetLowerLimit();
        }, function (v) {
            revoluteJoint.SetLimits(v, revoluteJoint.GetUpperLimit());
        });
        editList.createNumberEdit("最大角度", 0.1, function () {
            return revoluteJoint.GetUpperLimit();
        }, function (v) {
            revoluteJoint.SetLimits(revoluteJoint.GetLowerLimit(), v);
        });
        editList.createBooleanEdit("モーター", function () {
            return revoluteJoint.IsMotorEnabled();
        }, function (v) {
            revoluteJoint.EnableMotor(v);
        });
        editList.createNumberEdit("モーター速度", 0.1, function () {
            return revoluteJoint.GetMotorSpeed();
        }, function (v) {
            revoluteJoint.SetMotorSpeed(v);
        });
        editList.createNumberEdit("モータートルク", 0.1, function () {
            return revoluteJoint.GetMotorTorque();
        }, function (v) {
            revoluteJoint.SetMaxMotorTorque(v);
        });
        editList.createNumberEdit("反作用トルク", 0.1, function () {
            return revoluteJoint.GetReactionTorque();
        }, undefined);
        editList.createNumberEdit("反作用力.X", 0.1, function () {
            return revoluteJoint.GetReactionForce().x;
        }, undefined);
        editList.createNumberEdit("反作用力.Y", 0.1, function () {
            return revoluteJoint.GetReactionForce().y;
        }, undefined);
        editList.createBooleanEdit("アクテイブ", function () {
            return revoluteJoint.IsActive();
        }, undefined);
        editList.createNumberEdit("アンカー.X", 0.1, function () {
            return revoluteJoint.GetAnchorA().x;
        }, undefined);
        editList.createNumberEdit("アンカー.Y", 0.1, function () {
            return revoluteJoint.GetAnchorA().y;
        }, undefined);
        editList.createNumberEdit("角度", 0.1, function () {
            return revoluteJoint.GetJointAngle();
        }, undefined);
        editList.createNumberEdit("速度", 0.1, function () {
            return revoluteJoint.GetJointSpeed();
        }, undefined);
        return {
            object: revoluteJoint,
            control: editList.root,
            update: update
        };
    }
    Phyzkit.createRevoluteJointEditor = createRevoluteJointEditor;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    function createObjectEditor(sandbox) {
        function buildEditor(object) {
            panel.content.empty();
            if(object instanceof Box2D.Dynamics.Joints.b2RevoluteJoint) {
                currentEditor = Phyzkit.createRevoluteJointEditor(sandbox, object);
                panel.content.append("<h3>回転ジョイント</h3>");
                panel.content.append(currentEditor.control);
                panel.content.slideDown("fast");
            } else {
                if(object instanceof Box2D.Dynamics.b2Body) {
                    panel.content.append("<h3>ボディ</h3>");
                    currentEditor = Phyzkit.createBodyEditor(sandbox, object);
                    panel.content.append(currentEditor.control);
                    panel.content.slideDown("fast");
                } else {
                    if(object instanceof Box2D.Dynamics.b2Fixture) {
                        panel.content.append("<h3>フィクスチャ</h3>");
                        currentEditor = Phyzkit.createFixtureEditor(sandbox, object);
                        panel.content.append(currentEditor.control);
                        panel.content.slideDown("fast");
                    }
                }
            }
        }
        function update() {
            var selectedObject = sandbox.selectedObjects[0];
            if(currentEditor && selectedObject !== currentEditor.object) {
                currentEditor.control.remove();
                currentEditor = undefined;
            }
            if(!currentEditor || currentEditor.object !== selectedObject) {
                buildEditor(selectedObject);
            }
            if(currentEditor) {
                currentEditor.update();
            }
        }
        var currentEditor;
        var panel = new Phyzkit.DropDownWindow("プロパティ", function () {
            return sandbox.selectedObjects.length > 0;
        }, update);
        return panel;
    }
    Phyzkit.createObjectEditor = createObjectEditor;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    function createBodyEditor(sandbox, body) {
        function update() {
            editList.update();
        }
        var editList = Phyzkit.createEditList();
        function tuple(text, value) {
            var o = {
            };
            o.text = text;
            o.value = value;
            return o;
        }
        editList.createEnumEdit("種類", [
            tuple("静的", Box2D.Dynamics.b2Body.b2_staticBody), 
            tuple("運動学的", Box2D.Dynamics.b2Body.b2_kinematicBody), 
            tuple("動的", Box2D.Dynamics.b2Body.b2_dynamicBody)
        ], function () {
            return body.GetType();
        }, function (value) {
            body.SetType(value);
        });
        editList.createNumberEdit("位置.X", 0.1, function () {
            return body.GetPosition().x;
        }, function (v) {
            body.SetPosition(new Box2D.Common.Math.b2Vec2(v, body.GetPosition().y));
        });
        editList.createNumberEdit("位置.Y", 0.1, function () {
            return body.GetPosition().y;
        }, function (v) {
            body.SetPosition(new Box2D.Common.Math.b2Vec2(body.GetPosition().x, v));
        });
        editList.createNumberEdit("角度", 0.1, function () {
            return body.GetAngle();
        }, function (v) {
            body.SetAngle(v);
        });
        editList.createNumberEdit("速度.X", 0.1, function () {
            return body.GetLinearVelocity().x;
        }, function (v) {
            body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(v, body.GetLinearVelocity().y));
        });
        editList.createNumberEdit("速度.Y", 0.1, function () {
            return body.GetLinearVelocity().y;
        }, function (v) {
            body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(body.GetLinearVelocity().x, v));
        });
        editList.createNumberEdit("角速度", 0.1, function () {
            return body.GetAngularVelocity();
        }, function (v) {
            body.SetAngularVelocity(v);
        });
        editList.createNumberEdit("移動減衰", 0.1, function () {
            return body.GetLinearDamping();
        }, function (v) {
            body.SetLinearDamping(v);
        });
        editList.createNumberEdit("回転減衰", 0.1, function () {
            return body.GetAngularDamping();
        }, function (v) {
            body.SetAngularDamping(v);
        });
        editList.createNumberEdit("質量", 0.1, function () {
            return body.GetMass();
        }, function (v) {
            var m = new Box2D.Collision.Shapes.b2MassData();
            body.GetMassData(m);
            m.mass = v;
            body.SetMassData(m);
        });
        editList.createNumberEdit("慣性", 0.1, function () {
            return body.GetInertia();
        }, function (v) {
            var m = new Box2D.Collision.Shapes.b2MassData();
            body.GetMassData(m);
            m.I = v;
            body.SetMassData(m);
        });
        editList.createNumberEdit("重心.X", 0.1, function () {
            return body.GetWorldCenter().x;
        }, function (v) {
            var m = new Box2D.Collision.Shapes.b2MassData();
            body.GetMassData(m);
            m.center.x = v;
            body.SetMassData(m);
        });
        editList.createNumberEdit("重心.Y", 0.1, function () {
            return body.GetWorldCenter().y;
        }, function (v) {
            var m = new Box2D.Collision.Shapes.b2MassData();
            body.GetMassData(m);
            m.center.y = v;
            body.SetMassData(m);
        });
        editList.createBooleanEdit("回転固定", function () {
            return body.IsFixedRotation();
        }, function (v) {
            body.SetFixedRotation(v);
        });
        editList.createBooleanEdit("弾丸", function () {
            return body.IsBullet();
        }, function (v) {
            body.SetBullet(v);
        });
        editList.createBooleanEdit("睡眠可能", function () {
            return body.IsSleepingAllowed();
        }, function (v) {
            body.SetSleepingAllowed(v);
        });
        editList.createBooleanEdit("覚醒", function () {
            return body.IsAwake();
        }, function (v) {
            body.SetAwake(v);
        });
        editList.createBooleanEdit("有効", function () {
            return body.IsActive();
        }, function (v) {
            body.SetActive(v);
        });
        return {
            object: body,
            control: editList.root,
            update: update
        };
    }
    Phyzkit.createBodyEditor = createBodyEditor;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    function createMovingTool(sandbox) {
        function getZGizmoRadius(viewport) {
            return 0.2 * Math.min(viewport.canvas.width(), viewport.canvas.height());
        }
        function getXYGizmoLength(viewport) {
            return getZGizmoRadius(viewport) * 1.5;
        }
        function getSelectedBody() {
            if(sandbox && sandbox.selectedBodies.length > 0) {
                return sandbox.selectedBodies[0];
            } else {
                return undefined;
            }
        }
        function intersectGizmo(p, q, v, r) {
            var k = v.LengthSquared();
            var s = ((p.x - q.x) * v.x + (p.y - q.y) * v.y) / k;
            var h = new Box2D.Common.Math.b2Vec2(q.x + v.x * s, q.y + v.y * s);
            var l = new Box2D.Common.Math.b2Vec2(p.x - h.x, p.y - h.y).Length();
            var m = new Box2D.Common.Math.b2Vec2(p.x - q.x, p.y - q.y).Length();
            var n = new Box2D.Common.Math.b2Vec2(p.x - q.x - v.x, p.y - q.y - v.y).Length();
            return ((l <= r) && (0 <= s && s <= 1)) || (m <= r) || (n <= r);
        }
        function isGizmoActive(mp, bodyPos, angle) {
            var length = getXYGizmoLength(sandbox.viewport);
            return mp && bodyPos && intersectGizmo(mp, bodyPos, new Box2D.Common.Math.b2Vec2(length * Math.cos(angle), length * Math.sin(angle)), 10);
        }
        function isXGizmoActive(mp, bodyPos) {
            return isGizmoActive(mp, bodyPos, 0);
        }
        function isYGizmoActive(mp, bodyPos) {
            return isGizmoActive(mp, bodyPos, -Math.PI / 2);
        }
        function isZGizmoActive(mp, pos, viewport) {
            var range = Math.sqrt(Math.pow(mp.x - pos.x, 2) + Math.pow(mp.y - pos.y, 2));
            return Math.abs(range - getZGizmoRadius(viewport)) < 20;
        }
        function dispose() {
            gizmoActions = [];
            disposeAction();
        }
        function scaleShape(body, dragStartPoint, mousePoint, initialShapes) {
            var o = body.GetPosition();
            var p = sandbox.viewport.toWorldCoords(dragStartPoint);
            var q = sandbox.viewport.toWorldCoords(mousePoint);
            var r = Math.sqrt(Math.pow(o.x - p.x, 2) + Math.pow(o.y - p.y, 2));
            var s = Math.sqrt(Math.pow(o.x - q.x, 2) + Math.pow(o.y - q.y, 2));
            var t = Math.max(0.5, Math.min(2, s / r));
            for(var fixture = body.GetFixtureList(), i = 0; fixture; fixture = fixture.GetNext() , i++) {
                var shape = fixture.GetShape();
                if(shape instanceof Box2D.Collision.Shapes.b2PolygonShape) {
                    var initialVertices = initialShapes[i].GetVertices();
                    shape.GetVertices().forEach(function (vertex, k) {
                        vertex.x = initialVertices[k].x * t;
                        vertex.y = initialVertices[k].y * t;
                        vertex.z = initialVertices[k].z * t;
                    });
                } else {
                    if(shape instanceof Box2D.Collision.Shapes.b2CircleShape) {
                        shape.SetRadius(initialShapes[i].GetRadius() * t);
                    } else {
                        console.log("sacleShape: Unknown shape type. Scaling operation ignored.");
                    }
                }
            }
        }
        function getBodiesCenter() {
            var bodies = sandbox.selectedBodies;
            var gizmoPosWorld = new Box2D.Common.Math.b2Vec2(0, 0);
            bodies.forEach(function (body) {
                var pos = body.GetPosition();
                gizmoPosWorld.x += pos.x;
                gizmoPosWorld.y += pos.y;
            });
            gizmoPosWorld.x /= bodies.length;
            gizmoPosWorld.y /= bodies.length;
            return sandbox.viewport.toScreenCoords(gizmoPosWorld);
        }
        var mousePoint;
        var xGizmoAction;
        var yGizmoAction;
        var zGizmoAction;
        var disposeAction = function () {
        };

        var gizmoActions = [];
        return {
            toolButtonStyle: "tool_move",
            tooltip: "移動：物体をドラッグで移動します",
            mousedown: function (event, sandbox) {
                if(event.button == 0) {
                    var mp = Phyzkit.pointFromEvent(event);
                    var p = sandbox.viewport.toWorldCoords(mp);
                    var mouseDownPoint = p;
                    if(gizmoActions.length == 0) {
                        var bodies = sandbox.selectedBodies;
                        if(bodies.length > 0) {
                            var gizmoPos = getBodiesCenter();
                            var xGizmoActive = isXGizmoActive(mp, gizmoPos);
                            var yGizmoActive = isYGizmoActive(mp, gizmoPos);
                            bodies.forEach(function (body) {
                                var pos = sandbox.viewport.toScreenCoords(body.GetPosition());
                                var range = Math.pow(mp.x - pos.x, 2) + Math.pow(mp.y - pos.y, 2);
                                var initialBodyPosition = body.GetPosition().Copy();
                                if(xGizmoActive) {
                                    gizmoActions.push({
                                        move: function (event) {
                                            var point = sandbox.viewport.toWorldCoords(Phyzkit.pointFromEvent(event));
                                            body.SetPosition(new Box2D.Common.Math.b2Vec2(initialBodyPosition.x + point.x - mouseDownPoint.x, body.GetPosition().y));
                                        }
                                    });
                                }
                                if(yGizmoActive) {
                                    gizmoActions.push({
                                        move: function (event) {
                                            var point = sandbox.viewport.toWorldCoords(Phyzkit.pointFromEvent(event));
                                            body.SetPosition(new Box2D.Common.Math.b2Vec2(body.GetPosition().x, initialBodyPosition.y + point.y - mouseDownPoint.y));
                                        }
                                    });
                                }
                                if(gizmoActions.length == 0 && isZGizmoActive(mp, pos, sandbox.viewport)) {
                                    (function () {
                                        var initialShapes = [];
                                        for(var fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
                                            initialShapes.push(fixture.GetShape().Copy());
                                        }
                                        var mouseDownAngle = Math.atan2(mp.y - pos.y, mp.x - pos.x);
                                        var initialBodyAngle = body.GetAngle();
                                        gizmoActions.push({
                                            move: function (event) {
                                                var point = Phyzkit.pointFromEvent(event);
                                                if(event.shiftKey) {
                                                    scaleShape(body, mp, Phyzkit.pointFromEvent(event), initialShapes);
                                                } else {
                                                    var mouseAngle = Math.atan2(point.y - pos.y, point.x - pos.x);
                                                    body.SetAngle(initialBodyAngle - mouseAngle + mouseDownAngle);
                                                }
                                            }
                                        });
                                    })();
                                }
                                if(gizmoActions.length > 0) {
                                    var initialBodyType = body.GetType();
                                    var initialLinearVelocity = body.GetLinearVelocity().Copy();
                                    var initialAngularVelocity = body.GetAngularVelocity();
                                    body.SetType(Box2D.Dynamics.b2Body.b2_kinematicBody);
                                    body.SetPosition(body.GetPosition().Copy());
                                    body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(0, 0));
                                    body.SetAngularVelocity(0);
                                    body.SetAwake(true);
                                    disposeAction = function () {
                                        body.SetType(initialBodyType);
                                        body.SetLinearVelocity(initialLinearVelocity);
                                        body.SetAngularVelocity(initialAngularVelocity);
                                        disposeAction = function () {
                                        };
                                    };
                                }
                            });
                        }
                    }
                }
            },
            mousemove: function (event, sandbox) {
                gizmoActions.forEach(function (action) {
                    action.move(event);
                });
                mousePoint = Phyzkit.pointFromEvent(event);
            },
            mouseup: function () {
                if(gizmoActions.length > 0) {
                    dispose();
                } else {
                    var selectedFixture = Phyzkit.getFixtureAt(sandbox.world, sandbox.viewport.toWorldCoords(Phyzkit.pointFromEvent(event)));
                    if(selectedFixture) {
                        var body = selectedFixture.GetBody();
                        if(event.ctrlKey) {
                            sandbox.toggleObjectSelection(body);
                        } else {
                            sandbox.clearSelection();
                            sandbox.selectObject(body);
                        }
                    }
                }
            },
            mouseout: function () {
                dispose();
            },
            paint: function (g, viewport) {
                function drawArrow(angle, color) {
                    var length = getXYGizmoLength(viewport);
                    var line = mousePoint && intersectGizmo(mousePoint, gizmoPos, new Box2D.Common.Math.b2Vec2(length * Math.cos(angle), length * Math.sin(angle)), 10) ? 2 : 1;
                    g.lineWidth = 4 * line;
                    g.save();
                    g.translate(gizmoPos.x, gizmoPos.y);
                    g.rotate(angle);
                    g.beginPath();
                    g.moveTo(0, 0);
                    g.lineTo(length, 0);
                    g.strokeStyle = color;
                    g.stroke();
                    g.beginPath();
                    g.moveTo(length + 15 * line, 0);
                    g.lineTo(length, 5 * line);
                    g.lineTo(length, -5 * line);
                    g.fillStyle = color;
                    g.fill();
                    g.restore();
                }
                if(sandbox.selectedBodies.length > 0) {
                    var gizmoPos = getBodiesCenter();
                    var body = sandbox.selectedBodies[0];
                    var bodyPos = viewport.toScreenCoords(body.GetPosition());
                    var radius = getZGizmoRadius(viewport);
                    g.beginPath();
                    g.arc(gizmoPos.x, gizmoPos.y, radius, 0, 7);
                    g.strokeStyle = "rgba(64, 64, 255, 0.5)";
                    g.lineWidth = mousePoint && isZGizmoActive(mousePoint, gizmoPos, sandbox.viewport) ? 8 : 4;
                    g.stroke();
                    drawArrow(0, "rgba(255, 64,  64, 0.5)");
                    drawArrow(-Math.PI / 2, "rgba(64, 255,  64, 0.5)");
                }
            }
        };
    }
    Phyzkit.createMovingTool = createMovingTool;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    var SELECTION_RECT_FILL_COLOR = "rgba(60, 60, 250, 0.6)";
    var SELECTION_RECT_STROKE_COLOR = "rgba(60, 60, 250, 1.0)";
    function createSelectionTool() {
        var start;
        var end;

        return {
            toolButtonStyle: "tool_select",
            tooltip: "選択ツール　クリックで物体を選択。ドラッグで範囲を選択（わりと大雑把）。さらにクリックすると Fixture を選択",
            mousedown: function (event, sandbox) {
                var ctrlKey = (event).ctrlKey;
                if(event.which === 1) {
                    var mousePointInScreen = Phyzkit.pointFromEvent(event);
                    var mousePointInWorld = sandbox.viewport.toWorldCoords(mousePointInScreen);
                    var clickedFixture = Phyzkit.getFixtureAt(sandbox.world, mousePointInWorld);
                    if(clickedFixture) {
                        var body = clickedFixture.GetBody();
                        if(ctrlKey) {
                            sandbox.toggleObjectSelection(body);
                        } else {
                            sandbox.clearSelection();
                            sandbox.selectObject(body);
                        }
                    } else {
                        start = mousePointInScreen;
                    }
                }
            },
            mousemove: function (event, sandbox) {
                if(event.which === 1 && !event.shiftKey) {
                    end = Phyzkit.pointFromEvent(event);
                }
            },
            mouseup: function (event, sandbox) {
                if(event.which === 1 && !event.shiftKey && start && end && Math.abs(start.x - end.x) > 10 && Math.abs(start.y - end.y) > 10) {
                    if(!event.ctrlKey) {
                        sandbox.clearSelection();
                    }
                    var aabb = new Box2D.Collision.b2AABB();
                    aabb.lowerBound = sandbox.viewport.toWorldCoords(new Box2D.Common.Math.b2Vec2(Math.min(start.x, end.x), Math.max(start.y, end.y)));
                    aabb.upperBound = sandbox.viewport.toWorldCoords(new Box2D.Common.Math.b2Vec2(Math.max(start.x, end.x), Math.min(start.y, end.y)));
                    sandbox.world.QueryAABB(function (fixture) {
                        sandbox.selectObject(fixture);
                        return true;
                    }, aabb);
                }
                start = undefined;
                end = undefined;
            },
            mouseout: function () {
                start = undefined;
                end = undefined;
            },
            paint: function (g, viewport) {
                if(start && end) {
                    g.fillStyle = SELECTION_RECT_FILL_COLOR;
                    g.fillRect(start.x, start.y, end.x - start.x, end.y - start.y);
                    g.lineWidth = 1;
                    g.strokeStyle = SELECTION_RECT_STROKE_COLOR;
                    g.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
                }
            }
        };
    }
    Phyzkit.createSelectionTool = createSelectionTool;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var M = Box2D.Common.Math;
    ; ;
    var D = Box2D.Dynamics;
    ; ;
    var S = Box2D.Collision.Shapes;
    ; ;
    var C = Box2D.Collision;
    ; ;
    function createHandTool() {
        var body;
        var bodyType;
        var fixedRotation;
        var joint;

        function dispose() {
            if(joint) {
                body.SetType(bodyType);
                body.SetFixedRotation(fixedRotation);
                body.GetWorld().DestroyJoint(joint);
                joint = undefined;
            }
        }
        return {
            toolButtonStyle: "tool_hand",
            tooltip: "ハンド：物体を掴んで引っ張ったり投げたりします",
            mousedown: function (event, sandbox) {
                var p = sandbox.viewport.toWorldCoords(Phyzkit.pointFromEvent(event));
                if(!joint) {
                    body = undefined;
                    sandbox.world.QueryPoint(function (fixture) {
                        body = fixture.GetBody();
                        return false;
                    }, p);
                    if(body) {
                        bodyType = body.GetType();
                        fixedRotation = body.IsFixedRotation();
                        body.SetType(Box2D.Dynamics.b2Body.b2_dynamicBody);
                        body.SetAwake(true);
                        body.SetActive(true);
                        var def = new Box2D.Dynamics.Joints.b2MouseJointDef();
                        def.bodyA = sandbox.world.GetGroundBody();
                        def.bodyB = body;
                        def.target.Set(p.x, p.y);
                        def.maxForce = 3000 * body.GetMass();
                        joint = sandbox.world.CreateJoint(def);
                        joint.SetUserData({
                            name: "ハンドツール",
                            paint: function (g) {
                            }
                        });
                    }
                }
            },
            mousemove: function (event, sandbox) {
                if(joint) {
                    joint.SetTarget(sandbox.viewport.toWorldCoords(Phyzkit.pointFromEvent(event)));
                }
            },
            mouseup: function () {
                dispose();
            },
            mouseout: function () {
                dispose();
            },
            paint: function (g, viewport) {
                if(body) {
                }
            }
        };
    }
    Phyzkit.createHandTool = createHandTool;
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    (function (GameToolkit) {
        function attachToolButtons(sandbox) {
            sandbox.addToolButton(Phyzkit.GameToolkit.createRectTool());
            sandbox.addToolButton(Phyzkit.GameToolkit.createBoxTool(0.2));
            sandbox.addToolButton(Phyzkit.GameToolkit.createBallTool(0.1));
            sandbox.addToolButton(Phyzkit.GameToolkit.createSimplePolygonTool());
            sandbox.addToolButton(Phyzkit.GameToolkit.createPolygonTransformTool());
            sandbox.addToolButton(Phyzkit.GameToolkit.createPasteTool());
        }
        GameToolkit.attachToolButtons = attachToolButtons;
    })(Phyzkit.GameToolkit || (Phyzkit.GameToolkit = {}));
    var GameToolkit = Phyzkit.GameToolkit;

})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    (function (GameToolkit) {
        var BODY_TYPE_NAME = "simple_ball";
        var FIXTURE_TYPE_NAME = "fixture_simple_ball";
        var SOCCER_BALL_IMAGE = "js/phyzkit/toolkit/soccer.png";
        var ballImage = Phyzkit.loader.request(SOCCER_BALL_IMAGE);
        var crateCount = 0;
        function createBallUserData(name) {
            return {
            };
        }
        GameToolkit.createBallUserData = createBallUserData;
        var BallFixtureUserData = (function () {
            function BallFixtureUserData() {
                this.name = "ボール";
            }
            BallFixtureUserData.prototype.paint = function (g, fixture) {
                var shape = fixture.GetShape();
                if(shape instanceof Box2D.Collision.Shapes.b2CircleShape) {
                    var circle = shape;
                    if(ballImage.complete) {
                        var radius = circle.GetRadius();
                        var pos = circle.GetLocalPosition();
                        g.translate(pos.x - radius, pos.y - radius);
                        g.scale(radius * 2 / ballImage.width, radius * 2 / ballImage.height);
                        g.drawImage(ballImage, 0, 0);
                    }
                } else {
                    console.log("WARNING:class BallFixtureUserData / A BallFixtureUserData instance is attached a ficture that has NOT b2CircleShape.");
                }
            };
            BallFixtureUserData.prototype.serialize = function () {
                return {
                    name: this.name,
                    type: FIXTURE_TYPE_NAME
                };
            };
            BallFixtureUserData.prototype.copy = function () {
                return new BallFixtureUserData();
            };
            return BallFixtureUserData;
        })();
        GameToolkit.BallFixtureUserData = BallFixtureUserData;        
        function createBallFixtureUserData(name) {
            return new BallFixtureUserData();
        }
        GameToolkit.createBallFixtureUserData = createBallFixtureUserData;
        function createBall(world, radius, position) {
            var bodyDef = new Box2D.Dynamics.b2BodyDef();
            bodyDef.linearDamping = 0.1;
            bodyDef.angularDamping = 0.1;
            bodyDef.bullet = true;
            bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
            bodyDef.position.x = position.x;
            bodyDef.position.y = position.y;
            bodyDef.userData = undefined;
            var body = world.CreateBody(bodyDef);
            var fixDef = new Box2D.Dynamics.b2FixtureDef();
            fixDef.density = 1;
            fixDef.friction = 0.4;
            fixDef.restitution = 0.2;
            fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(radius);
            fixDef.userData = createBallFixtureUserData("ボール" + (crateCount++));
            body.CreateFixture(fixDef);
            return body;
        }
        GameToolkit.createBall = createBall;
        Phyzkit.SANDBOX.putUserDataDeserializer(BODY_TYPE_NAME, function (data) {
            return createBallUserData(data.name);
        });
        Phyzkit.SANDBOX.putUserDataDeserializer(FIXTURE_TYPE_NAME, function (data) {
            return createBallFixtureUserData(data.name);
        });
    })(Phyzkit.GameToolkit || (Phyzkit.GameToolkit = {}));
    var GameToolkit = Phyzkit.GameToolkit;

})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    var BODY_TYPE_NAME = "toolkit_simple_polygon";
    var FIXTURE_TYPE_NAME = "toolkit_fixture_simple_polygon";
    var PolygonFixtureUserData = (function () {
        function PolygonFixtureUserData() {
            this.name = "ポリゴン";
        }
        PolygonFixtureUserData.prototype.paint = function (g, fixture) {
            var shape = fixture.GetShape();
            if(shape instanceof Box2D.Collision.Shapes.b2PolygonShape) {
                var polygon = shape;
                var vertices = polygon.GetVertices();
                var count = polygon.GetVertexCount();
                g.save();
                g.beginPath();
                for(var i = 0; i < count; i++) {
                    var vertex = vertices[i];
                    (i == 0 ? g.moveTo(vertex.x, vertex.y) : g.lineTo(vertex.x, vertex.y));
                }
                g.closePath();
                g.fillStyle = "rgb(20, 20, 40)";
                g.fill();
                g.restore();
            } else {
                console.log("WARNING:class PolygonFixtureUserData / A PolygonFixtureUserData instance is attached a ficture that has NOT b2PolygonShape.");
            }
        };
        PolygonFixtureUserData.prototype.serialize = function () {
            return {
                name: this.name,
                type: FIXTURE_TYPE_NAME
            };
        };
        PolygonFixtureUserData.prototype.copy = function () {
            return new PolygonFixtureUserData();
        };
        return PolygonFixtureUserData;
    })();
    Phyzkit.PolygonFixtureUserData = PolygonFixtureUserData;    
    var PolygonBodyUserData = (function () {
        function PolygonBodyUserData() {
            this.name = "ポリゴン";
        }
        PolygonBodyUserData.prototype.serialize = function () {
            return {
                name: this.name,
                type: BODY_TYPE_NAME
            };
        };
        PolygonBodyUserData.prototype.copy = function () {
            return new PolygonBodyUserData();
        };
        return PolygonBodyUserData;
    })();    
    function createPolygon(world, bodyType, vertices) {
        var bodyDef = new Box2D.Dynamics.b2BodyDef();
        bodyDef.angularDamping = 0;
        bodyDef.type = bodyType;
        bodyDef.fixedRotation = false;
        bodyDef.userData = new PolygonBodyUserData();
        var fixDef = new Box2D.Dynamics.b2FixtureDef();
        fixDef.density = 1;
        fixDef.friction = 0.4;
        fixDef.restitution = 0.2;
        fixDef.userData = new PolygonFixtureUserData();
        var polygon = new Box2D.Collision.Shapes.b2PolygonShape();
        polygon.SetAsArray(vertices, vertices.length);
        fixDef.shape = polygon;
        var body = world.CreateBody(bodyDef);
        body.CreateFixture(fixDef);
        return body;
    }
    Phyzkit.createPolygon = createPolygon;
    function createPolygonFixture(body, vertices) {
        var fixDef = new Box2D.Dynamics.b2FixtureDef();
        fixDef.density = 1;
        fixDef.friction = 0.4;
        fixDef.restitution = 0.2;
        fixDef.userData = new PolygonFixtureUserData();
        var polygon = new Box2D.Collision.Shapes.b2PolygonShape();
        polygon.SetAsArray(vertices, vertices.length);
        fixDef.shape = polygon;
        var fixture = body.CreateFixture(fixDef);
        return fixture;
    }
    Phyzkit.createPolygonFixture = createPolygonFixture;
    Phyzkit.SANDBOX.putUserDataDeserializer(BODY_TYPE_NAME, function (data) {
        return new PolygonBodyUserData();
    });
    Phyzkit.SANDBOX.putUserDataDeserializer(FIXTURE_TYPE_NAME, function (data) {
        return new PolygonFixtureUserData();
    });
})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    (function (GameToolkit) {
        var CRATE_BODY_TYPE_IDENTIFIER = "toolkit_crate";
        var BOX_IMAGE_URL = "box.png";
        var sourcePath = "js/phyzkit/toolkit/box.png";
        var boxImage = Phyzkit.loader.request(sourcePath);
        var crateCount = 0;
        var CrateBodyUserData = (function () {
            function CrateBodyUserData(name, imageScaleX, imageScaleY, imageTranslateX, imageTranslateY, image) {
                this.name = name;
                this.imageScaleX = imageScaleX;
                this.imageScaleY = imageScaleY;
                this.imageTranslateX = imageTranslateX;
                this.imageTranslateY = imageTranslateY;
                this.image = image;
                this.name = "木箱";
            }
            CrateBodyUserData.prototype.paint = function (g, body) {
                var _this = this;
                if(this.image.complete && body.GetFixtureList() && body.GetFixtureList().GetShape()) {
                    var imageScaleX = this.imageScaleX / this.image.width;
                    var imageScaleY = this.imageScaleY / this.image.height;
                    g.translate(this.imageTranslateX, this.imageTranslateY);
                    g.scale(imageScaleX, imageScaleY);
                    var pattern = g.createPattern(this.image, "repeat");
                    g.fillStyle = pattern;
                    for(var fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
                        var shape = fixture.GetShape();
                        if(shape instanceof Box2D.Collision.Shapes.b2PolygonShape) {
                            var polygon = shape;
                            g.beginPath();
                            polygon.GetVertices().forEach(function (vertex, index) {
                                if(index == 0) {
                                    g.moveTo((vertex.x - _this.imageTranslateX) / imageScaleX, (vertex.y - _this.imageTranslateY) / imageScaleY);
                                } else {
                                    g.lineTo((vertex.x - _this.imageTranslateX) / imageScaleX, (vertex.y - _this.imageTranslateY) / imageScaleY);
                                }
                            });
                            g.closePath();
                            g.fill();
                        }
                    }
                }
            };
            CrateBodyUserData.prototype.serialize = function () {
                return {
                    name: this.name,
                    type: CRATE_BODY_TYPE_IDENTIFIER,
                    imageScaleX: this.imageScaleX,
                    imageScaleY: this.imageScaleY,
                    imageTranslateX: this.imageTranslateX,
                    imageTranslateY: this.imageTranslateY,
                    imageSrc: this.image.src
                };
            };
            CrateBodyUserData.deserialize = function deserialize(json) {
                if(json.type !== CRATE_BODY_TYPE_IDENTIFIER) {
                    throw "Error: CrateBodyUserData#deserialize: invalid argument json data type.";
                }
                var image = new Image();
                image.src = json.imageSrc;
                return new CrateBodyUserData(json.name, json.imageScaleX, json.imageScaleY, json.imageTranslateX, json.imageTranslateY, image);
            }
            CrateBodyUserData.prototype.copy = function () {
                return new CrateBodyUserData(this.name, this.imageScaleX, this.imageScaleY, this.imageTranslateX, this.imageTranslateY, this.image);
            };
            return CrateBodyUserData;
        })();
        GameToolkit.CrateBodyUserData = CrateBodyUserData;        
        function createCrateBodyUserData(name, imageScaleX, imageScaleY, imageTranslateX, imageTranslateY, image) {
            return new CrateBodyUserData(name, imageScaleX, imageScaleY, imageTranslateX, imageTranslateY, image);
        }
        function createImagCrateBody(world, image, scale, position) {
            var bodyDef = new Box2D.Dynamics.b2BodyDef();
            bodyDef.linearDamping = 0;
            bodyDef.angularDamping = 0;
            bodyDef.bullet = true;
            bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
            bodyDef.position.x = position.x;
            bodyDef.position.y = position.y;
            bodyDef.userData = createCrateBodyUserData("木箱" + (crateCount++), scale * image.width, scale * image.height, -scale / 2 * image.width, -scale / 2 * image.height, image);
            var body = world.CreateBody(bodyDef);
            var fixDef = new Box2D.Dynamics.b2FixtureDef();
            fixDef.density = 1;
            fixDef.friction = 0.4;
            fixDef.restitution = 0.2;
            var polygon = new Box2D.Collision.Shapes.b2PolygonShape();
            polygon.SetAsBox(scale / 2 * image.width, scale / 2 * image.height);
            fixDef.shape = polygon;
            body.CreateFixture(fixDef);
            return body;
        }
        function createImageCrate(world, boxSize, position) {
            return createImagCrateBody(world, boxImage, boxSize * 2 / boxImage.width, position);
        }
        GameToolkit.createImageCrate = createImageCrate;
        Phyzkit.SANDBOX.putUserDataDeserializer(CRATE_BODY_TYPE_IDENTIFIER, function (data) {
            return CrateBodyUserData.deserialize(data);
        });
    })(Phyzkit.GameToolkit || (Phyzkit.GameToolkit = {}));
    var GameToolkit = Phyzkit.GameToolkit;

})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    (function (GameToolkit) {
        function createBallTool(radius) {
            if(!radius) {
                radius = 0.1;
            }
            return {
                tooltip: "ボール：クリックした位置にボールを作成します",
                toolButtonStyle: "tool_ball",
                click: function (e, sandbox) {
                    if(e.button == 0 && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                        var body = Phyzkit.GameToolkit.createBall(sandbox.world, radius, sandbox.viewport.toWorldCoords(Phyzkit.pointFromEvent(e)));
                        sandbox.clearSelection();
                        sandbox.selectObject(body);
                    }
                }
            };
        }
        GameToolkit.createBallTool = createBallTool;
        ; ;
    })(Phyzkit.GameToolkit || (Phyzkit.GameToolkit = {}));
    var GameToolkit = Phyzkit.GameToolkit;

})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    (function (GameToolkit) {
        function createBoxTool(boxSize) {
            return {
                tooltip: "木箱：クリックした位置に木箱を作成します",
                toolButtonStyle: "tool_box",
                click: function (e, sandbox) {
                    if(e.button == 0 && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                        var body = GameToolkit.createImageCrate(sandbox.world, boxSize, sandbox.viewport.toWorldCoords(Phyzkit.pointFromEvent(e)));
                        sandbox.clearSelection();
                        sandbox.selectObject(body);
                    }
                }
            };
        }
        GameToolkit.createBoxTool = createBoxTool;
        ; ;
    })(Phyzkit.GameToolkit || (Phyzkit.GameToolkit = {}));
    var GameToolkit = Phyzkit.GameToolkit;

})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    (function (GameToolkit) {
        function createPasteTool() {
            return {
                tooltip: "貼り付け：クリックした位置に現在のクリップボードの内容を貼り付けます",
                toolButtonStyle: "tool_paste",
                click: function (e, sandbox) {
                    if(e.button == 0 && !e.shiftKey && sandbox.clipboard.length > 0) {
                        var point = sandbox.viewport.toWorldCoords(Phyzkit.pointFromEvent(e));
                        var bodies = sandbox.clipboard.map(function (data) {
                            var body = Phyzkit.deserializeAndCreateBody(sandbox.world, data);
                            body.SetAwake(true);
                            body.SetActive(true);
                            return body;
                        });
                        var tx = point.x - bodies[0].GetPosition().x;
                        var ty = point.y - bodies[0].GetPosition().y;
                        bodies.forEach(function (body, i) {
                            var pos = body.GetPosition();
                            body.SetPosition(new Box2D.Common.Math.b2Vec2(pos.x + tx, pos.y + ty));
                        });
                    }
                }
            };
        }
        GameToolkit.createPasteTool = createPasteTool;
        ; ;
    })(Phyzkit.GameToolkit || (Phyzkit.GameToolkit = {}));
    var GameToolkit = Phyzkit.GameToolkit;

})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    (function (GameToolkit) {
        function createRectTool() {
            var start;
            var end;

            var that = {
                toolButtonStyle: "tool_rect",
                tooltip: "矩形：ドラッグして矩形ポリゴンを作成します。",
                mousedown: function (event) {
                    if(event.button == 0 && !event.shiftKey && !event.ctrlKey && !event.altKey) {
                        start = Phyzkit.pointFromEvent(event);
                    }
                },
                mousemove: function (event) {
                    if(!event.shiftKey) {
                        end = Phyzkit.pointFromEvent(event);
                    }
                },
                mouseup: function (event, sandbox) {
                    if(event.button == 0 && !event.shiftKey && start && end && Math.abs(start.x - end.x) > 10 && Math.abs(start.y - end.y) > 10) {
                        var s = sandbox.viewport.toWorldCoords(start);
                        var e = sandbox.viewport.toWorldCoords(end);
                        var cx = (s.x + e.x) / 2;
                        var cy = (s.y + e.y) / 2;
                        var hw = Math.abs(e.x - s.x) / 2;
                        var hh = Math.abs(e.y - s.y) / 2;
                        var body = Phyzkit.createPolygon(sandbox.world, Box2D.Dynamics.b2Body.b2_staticBody, [
                            new Box2D.Common.Math.b2Vec2(-hw, -hh), 
                            new Box2D.Common.Math.b2Vec2(+hw, -hh), 
                            new Box2D.Common.Math.b2Vec2(+hw, +hh), 
                            new Box2D.Common.Math.b2Vec2(-hw, +hh)
                        ]);
                        body.SetPosition(new Box2D.Common.Math.b2Vec2(cx, cy));
                        sandbox.clearSelection();
                        sandbox.selectObject(body);
                    }
                    start = undefined;
                    end = undefined;
                },
                mouseout: function () {
                    start = undefined;
                    end = undefined;
                },
                paint: function (g) {
                    if(start && end) {
                        g.fillStyle = "rgba(60, 60, 250, 0.6)";
                        g.fillRect(start.x, start.y, end.x - start.x, end.y - start.y);
                    }
                }
            };
            return that;
        }
        GameToolkit.createRectTool = createRectTool;
        ; ;
    })(Phyzkit.GameToolkit || (Phyzkit.GameToolkit = {}));
    var GameToolkit = Phyzkit.GameToolkit;

})(Phyzkit || (Phyzkit = {}));

var Phyzkit;
(function (Phyzkit) {
    (function (GameToolkit) {
        var D = Box2D.Dynamics;
        ; ;
        var M = Box2D.Common.Math;
        ; ;
        var S = Box2D.Collision.Shapes;
        ; ;
        var VERTEX_MARKER_SIZE = 6;
        var TOUCH_RANGE = VERTEX_MARKER_SIZE * 2;
        function range(p, q) {
            return Math.abs(p.x - q.x) + Math.abs(p.y - q.y);
        }
        function forEachVertex(polygonShape, callback) {
            var vs = polygonShape.GetVertices();
            for(var i = 0; i < polygonShape.GetVertexCount(); i++) {
                callback(vs[i], i);
            }
        }
        function packVertices(polygonShape) {
            var vs = [];
            for(var i = 0; i < polygonShape.GetVertexCount(); i++) {
                vs.push(polygonShape.GetVertices()[i].Copy());
            }
            return vs;
        }
        function round_plane(a, b, p) {
            if(!a || !b || !p) {
                throw new TypeError();
            }
            var v = new Box2D.Common.Math.b2Vec2(b.x - a.x, b.y - a.y);
            var t = new Box2D.Common.Math.b2Vec2(p.x - a.x, p.y - a.y);
            var k = v.x * t.y - v.y * t.x;
            if(k > 0) {
                return p;
            } else {
                var n = (b.y - a.y) / (b.x - a.x);
                var m = 1 / n;
                var cx = (p.y - a.y + n * a.x + m * p.x) / (n + m);
                var cy = (b.y - a.y) / (b.x - a.x) * (cx - a.x) + a.y;
                return new Box2D.Common.Math.b2Vec2(cx, cy);
            }
        }
        function _round(p, a, b, c, d) {
            p = round_plane(a, c, p);
            p = round_plane(d, b, p);
            p = round_plane(a, b, p);
            return p;
        }
        function round(vertices, p) {
            if(vertices.length <= 2) {
                return p;
            } else {
                var a = vertices[0];
                var b = vertices[vertices.length - 1];
                var c = vertices[1];
                var d = vertices[vertices.length - 2];
                if(isCounterClockwise(vertices)) {
                    return _round(p, a, b, c, d);
                } else {
                    return _round(p, b, a, d, c);
                }
            }
        }
        function getCenter(vertices) {
            var center = new Box2D.Common.Math.b2Vec2(0, 0);
            for(var i = 0; i < vertices.length; i++) {
                center.Add(vertices[i]);
            }
            center.Multiply(1 / vertices.length);
            return center;
        }
        function isCounterClockwise(vertices) {
            var center = getCenter(vertices);
            var area = 0;
            for(var i = 0; i < vertices.length; i++) {
                var p = vertices[i].Copy();
                var q = vertices[(i + 1) % vertices.length].Copy();
                p.Subtract(center);
                q.Subtract(center);
                area += (p.x * q.y) - (q.x * p.y);
            }
            return area > 0;
        }
        function paintVertex(graphics, point, isActive, isSelected) {
            if(!(graphics && point)) {
                throw "Invalid Argument: paintVertex";
            }
            var s = VERTEX_MARKER_SIZE + (isActive ? 0 : 0);
            graphics.fillStyle = isActive ? "red" : "rgb(255, 255, 255)";
            graphics.fillRect(point.x - s, point.y - s, s * 2, s * 2);
            graphics.lineWidth = isActive ? 2 : 1;
            graphics.strokeStyle = "black";
            graphics.strokeRect(point.x - s, point.y - s, s * 2, s * 2);
            if(isSelected) {
                graphics.fillStyle = "black";
                graphics.fillRect(point.x - s + 2, point.y - s + 2, s * 2 - 4, s * 2 - 4);
            }
        }
        function createSimplePolygonTool() {
            var VERTEX_MARKER_SIZE = 4;
            var vertices = [];
            var mousePoint;
            return {
                toolButtonStyle: "tool_simple_polygon",
                tooltip: "ポリゴン：クリックで頂点追加、多角形を閉じるとオブジェクト生成。凸多角形のみ",
                select: function (sandbox) {
                    sandbox.clearSelection();
                },
                mousedown: function (event, sandbox) {
                    if(event.button == 0 && !event.shiftKey && !event.ctrlKey && !event.altKey) {
                        mousePoint = Phyzkit.pointFromEvent(event);
                        var roundedMousePoint = round(vertices, sandbox.viewport.toWorldCoords(mousePoint));
                        var roundedMousePointInScreen = sandbox.viewport.toScreenCoords(roundedMousePoint);
                        if(vertices.length > 2 && range(sandbox.viewport.toScreenCoords(vertices[0]), roundedMousePointInScreen) < TOUCH_RANGE) {
                            if(!isCounterClockwise(vertices)) {
                                vertices = vertices.reverse();
                            }
                            if(sandbox.selectedBodies.length > 0) {
                                var parentBody = sandbox.selectedBodies[0];
                                vertices = vertices.map(function (v) {
                                    return parentBody.GetLocalPoint(v);
                                });
                                var fixture = Phyzkit.createPolygonFixture(parentBody, vertices);
                                sandbox.clearSelection();
                                sandbox.selectObject(fixture);
                            } else {
                                var center = getCenter(vertices);
                                vertices = vertices.map(function (v) {
                                    v.Subtract(center);
                                    return v;
                                });
                                var body = Phyzkit.createPolygon(sandbox.world, Box2D.Dynamics.b2Body.b2_staticBody, vertices);
                                body.SetPosition(center);
                                sandbox.clearSelection();
                                sandbox.selectObject(body);
                            }
                            vertices = [];
                        } else {
                            vertices.push(round(vertices, sandbox.viewport.toWorldCoords(mousePoint)));
                        }
                    }
                },
                mousemove: function (event, sandbox) {
                    if(!event.shiftKey) {
                        mousePoint = Phyzkit.pointFromEvent(event);
                    }
                },
                mouseup: function (event, sandbox) {
                    mousePoint = undefined;
                },
                mouseout: function () {
                    mousePoint = undefined;
                },
                paint: function (g, viewport, sandbox) {
                    if(vertices.length > 0) {
                        var points = vertices.map(viewport.toScreenCoords);
                        var rounded_mp = mousePoint ? round(vertices, viewport.toWorldCoords(mousePoint)) : undefined;
                        var s_mp = rounded_mp ? viewport.toScreenCoords(rounded_mp) : undefined;
                        g.beginPath();
                        points.forEach(function (p, i) {
                            g.lineTo(p.x, p.y);
                        });
                        if(s_mp) {
                            g.lineTo(s_mp.x, s_mp.y);
                        }
                        g.lineWidth = 4;
                        g.strokeStyle = "green";
                        g.stroke();
                        if(s_mp) {
                            var size = 4;
                            g.fillStyle = "yellow";
                            g.fillRect(s_mp.x - size, s_mp.y - size, size * 2, size * 2);
                        }
                        points.forEach(function (p) {
                            var size;
                            if(s_mp && range(s_mp, p) < TOUCH_RANGE) {
                                g.fillStyle = "red";
                                size = 2;
                            } else {
                                g.fillStyle = "black";
                                size = 2;
                            }
                            g.fillRect(p.x - size, p.y - size, size * 2, size * 2);
                        });
                    }
                },
                unselect: function () {
                    vertices = [];
                }
            };
        }
        GameToolkit.createSimplePolygonTool = createSimplePolygonTool;
        ; ;
        var controller;
        function createVertexMoveController(sandbox, fixture, selectedVertexIndices) {
            var shape = fixture.GetShape();
            if(shape instanceof S.b2PolygonShape) {
                var polygon = shape;
                var body = fixture.GetBody();
                var selected = [];
                for(var i = 0; i < selectedVertexIndices.length; i++) {
                    var vertexIndex = selectedVertexIndices[i];
                    selected.push({
                        index: vertexIndex,
                        initial: polygon.GetVertices()[vertexIndex].Copy()
                    });
                }
                return {
                    pointmove: function (delta) {
                        var vs = packVertices(polygon);
                        selected.forEach(function (v) {
                            function getV(i) {
                                return vs[((i % vs.length) + vs.length) % vs.length];
                            }
                            var p = sandbox.viewport.toScreenCoords(body.GetWorldPoint(v.initial));
                            p.x += delta.x;
                            p.y += delta.y;
                            vs[v.index] = _round(body.GetLocalPoint(sandbox.viewport.toWorldCoords(p)), getV(v.index + 1), getV(v.index - 1), getV(v.index + 2), getV(v.index - 2));
                        });
                        polygon.SetAsArray(vs, vs.length);
                        body.SetPosition(body.GetPosition().Copy());
                    }
                };
            } else {
                return {
                    pointmove: function (delta) {
                    }
                };
            }
        }
        function createPolygonTransformTool() {
            var mousePoint;
            var mousedownPoint;
            var selectedVertexIndices = [];
            function getEditablePoints(sandbox) {
                var points = [];
                sandbox.selectedObjects.forEach(function (obj) {
                    function createBodyEditPoint(body) {
                        points.push({
                            pointInScreen: sandbox.viewport.toScreenCoords(body.GetPosition().Copy()),
                            mousedown: function (event) {
                                var initialMousePoint = Phyzkit.pointFromEvent(event);
                                var lastMousePoint = initialMousePoint.Copy();
                                controller = {
                                    pointmove: function (delta) {
                                        var currentMousePoint = new Box2D.Common.Math.b2Vec2(initialMousePoint.x + delta.x, initialMousePoint.y + delta.y);
                                        var d = new Box2D.Common.Math.b2Vec2(currentMousePoint.x - lastMousePoint.x, currentMousePoint.y - lastMousePoint.y);
                                        Phyzkit.translateJointAnchor(sandbox, body, new Box2D.Common.Math.b2Vec2(-d.x, -d.y));
                                        var bodyPosInScreen = sandbox.viewport.toScreenCoords(body.GetPosition());
                                        body.SetPosition(sandbox.viewport.toWorldCoords(new Box2D.Common.Math.b2Vec2(bodyPosInScreen.x + d.x, bodyPosInScreen.y + d.y)));
                                        lastMousePoint = currentMousePoint.Copy();
                                    }
                                };
                            }
                        });
                    }
                    function createFixtureEditPoint(fixture) {
                        var fixture = obj;
                        var shape = fixture.GetShape();
                        if(shape instanceof Box2D.Collision.Shapes.b2PolygonShape) {
                            forEachVertex(shape, function (vertex, i) {
                                var vertexInScreen = sandbox.viewport.toScreenCoords(fixture.GetBody().GetWorldPoint(vertex));
                                points.push({
                                    mousedown: function (event) {
                                        if(selectedVertexIndices.length == 0 || (event.ctrlKey && selectedVertexIndices.indexOf(i) < 0)) {
                                            selectedVertexIndices.push(i);
                                        } else {
                                            selectedVertexIndices = [];
                                            selectedVertexIndices.push(i);
                                        }
                                        controller = createVertexMoveController(sandbox, fixture, selectedVertexIndices);
                                    },
                                    pointInScreen: vertexInScreen
                                });
                            });
                        } else {
                            if(shape instanceof Box2D.Collision.Shapes.b2CircleShape) {
                            }
                        }
                    }
                    function createRevoluteJointEditPoint(revoluteJoint) {
                        var initialAnchorInScreen = sandbox.viewport.toScreenCoords(revoluteJoint.GetAnchorA());
                        return {
                            mousedown: function (event) {
                                controller = {
                                    pointmove: function (delta) {
                                        var newAnchor = sandbox.viewport.toWorldCoords(new Box2D.Common.Math.b2Vec2(initialAnchorInScreen.x + delta.x, initialAnchorInScreen.y + delta.y));
                                        revoluteJoint.m_localAnchor1.SetV(revoluteJoint.GetBodyA().GetLocalPoint(newAnchor.Copy()));
                                        revoluteJoint.m_localAnchor2.SetV(revoluteJoint.GetBodyB().GetLocalPoint(newAnchor.Copy()));
                                        revoluteJoint.m_referenceAngle = revoluteJoint.GetBodyB().GetAngle() - revoluteJoint.GetBodyA().GetAngle();
                                    }
                                };
                            },
                            pointInScreen: sandbox.viewport.toScreenCoords(revoluteJoint.GetAnchorA())
                        };
                    }
                    if(obj instanceof Box2D.Dynamics.b2Body) {
                        createBodyEditPoint(obj);
                    } else {
                        if(obj instanceof Box2D.Dynamics.b2Fixture) {
                            createFixtureEditPoint(obj);
                        } else {
                            if(obj instanceof Box2D.Dynamics.Joints.b2RevoluteJoint) {
                                points.push(createRevoluteJointEditPoint(obj));
                            }
                        }
                    }
                });
                return points;
            }
            return {
                toolButtonStyle: "tool_polygon_edit",
                tooltip: "ポリゴン編集：ポリゴンフィクスチャの頂点を編集します。２つ以上頂点を選択して S で辺を分割。delete で頂点の削除　",
                select: function (sandbox) {
                    if(sandbox.selectedFixtures.length > 0) {
                        var fixture = sandbox.selectedFixtures[0];
                        sandbox.clearSelection();
                        if(fixture.GetShape() instanceof Box2D.Collision.Shapes.b2PolygonShape) {
                            sandbox.selectObject(fixture.GetBody());
                            sandbox.selectObject(fixture);
                        }
                    } else {
                        if(sandbox.selectedBodies.length > 0) {
                            var body = sandbox.selectedBodies[0];
                            sandbox.clearSelection();
                            sandbox.selectObject(body);
                            if(body.GetFixtureList() && body.GetFixtureList().GetShape() instanceof Box2D.Collision.Shapes.b2PolygonShape) {
                                sandbox.selectObject(body.GetFixtureList());
                            }
                        }
                    }
                    selectedVertexIndices = [];
                },
                keydown: function (event, sandbox) {
                    var keyCode = (event).keyCode;
                    var fixtures = sandbox.selectedFixtures;
                    if(fixtures.length > 0) {
                        var activeFixture = fixtures[0];
                        var shape = activeFixture.GetShape();
                        if(shape instanceof Box2D.Collision.Shapes.b2PolygonShape) {
                            var polygon = shape;
                            if(keyCode === 65 && event.ctrlKey) {
                                if(selectedVertexIndices.length === polygon.GetVertexCount()) {
                                    selectedVertexIndices = [];
                                } else {
                                    selectedVertexIndices = [];
                                    for(var i = 0; i < polygon.GetVertexCount(); i++) {
                                        selectedVertexIndices.push(i);
                                    }
                                }
                            } else {
                                if(keyCode === 83) {
                                    var vs = packVertices(polygon);
                                    var newVertices = [];
                                    for(var i = 0; i < vs.length; i++) {
                                        var v = vs[i];
                                        newVertices.push(v.Copy());
                                        var k = (i + 1) % vs.length;
                                        if(selectedVertexIndices.indexOf(i) >= 0 && selectedVertexIndices.indexOf(k) >= 0) {
                                            var t = vs[k];
                                            newVertices.push(new Box2D.Common.Math.b2Vec2((v.x + t.x) / 2, (v.y + t.y) / 2));
                                        }
                                    }
                                    polygon.SetAsArray(newVertices, newVertices.length);
                                    selectedVertexIndices = [];
                                } else {
                                    if(keyCode === 46) {
                                        var vs = packVertices(polygon);
                                        if(vs.length > 3) {
                                            var deleteTargets = selectedVertexIndices.slice(0, Math.max(0, vs.length - 3));
                                            var newVertices = [];
                                            forEachVertex(polygon, function (v, i) {
                                                if(deleteTargets.indexOf(i) < 0) {
                                                    newVertices.push(v.Copy());
                                                }
                                            });
                                            polygon.SetAsArray(newVertices, newVertices.length);
                                            selectedVertexIndices = [];
                                        }
                                    }
                                }
                            }
                            var body = activeFixture.GetBody();
                            body.SetPosition(body.GetPosition().Copy());
                        }
                    }
                },
                mousedown: function (event, sandbox) {
                    if(event.button == 0) {
                        mousedownPoint = Phyzkit.pointFromEvent(event);
                        var pointClicked = false;
                        getEditablePoints(sandbox).forEach(function (editablePoint) {
                            var pointInScreen = editablePoint.pointInScreen;
                            if(mousedownPoint && range(mousedownPoint, pointInScreen) < VERTEX_MARKER_SIZE) {
                                editablePoint.mousedown(event);
                                pointClicked = true;
                            }
                        });
                    }
                },
                mousemove: function (event, sandbox) {
                    mousePoint = Phyzkit.pointFromEvent(event);
                    if(controller) {
                        var delta = new Box2D.Common.Math.b2Vec2(mousePoint.x - mousedownPoint.x, mousePoint.y - mousedownPoint.y);
                        controller.pointmove(delta);
                    }
                },
                mouseup: function (event, sandbox) {
                    controller = undefined;
                    mousedownPoint = undefined;
                },
                mouseout: function () {
                    mousePoint = undefined;
                    controller = undefined;
                    mousedownPoint = undefined;
                },
                paint: function (g, viewport, sandbox) {
                    getEditablePoints(sandbox).forEach(function (editablePoint, i) {
                        var point = editablePoint.pointInScreen;
                        paintVertex(g, point, mousePoint && range(mousePoint, point) < VERTEX_MARKER_SIZE * 2, selectedVertexIndices.indexOf(i) >= 0);
                    });
                }
            };
        }
        GameToolkit.createPolygonTransformTool = createPolygonTransformTool;
        ; ;
    })(Phyzkit.GameToolkit || (Phyzkit.GameToolkit = {}));
    var GameToolkit = Phyzkit.GameToolkit;

})(Phyzkit || (Phyzkit = {}));

$(function () {
    var sandbox = new Phyzkit.SandBox();
    $(document.body).append(sandbox.container);
    Phyzkit.GameToolkit.attachToolButtons(sandbox);
    sandbox.viewport.background = Phyzkit.createLayeredBackground([
        Phyzkit.createSimpleBackground("white"), 
        Phyzkit.createGridBackground(0, 0, 0)
    ]);
    sandbox.start();
    Phyzkit.readParam("app", sandbox.loadScriptFromURL);
    Phyzkit.readParam("world", function (data) {
        sandbox.loadWorldFromURL(data, function () {
        });
    });
});
