var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var ButtonGroup = ReactBootstrap.ButtonGroup;
var Button = ReactBootstrap.Button;
var Input = ReactBootstrap.Input;
var Modal = ReactBootstrap.Modal;
var Accordion = ReactBootstrap.Accordion;
var Panel = ReactBootstrap.Panel;
var Tooltip = ReactBootstrap.Tooltip;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

var Container = React.createClass({
    getInitialState: function() {
        return { showMenu: false };
    },
    toggleShowMenu : function() {
        this.setState({showMenu : !this.state.showMenu});
    },
    render: function() {
        var _className = 'row-offcanvas row-offcanvas-right';
        if (this.state.showMenu) {
            _className += ' active';
        }
        return (
            <Grid>
                <Row className={_className}>
                    <Col xs={12} sm={9}>
                         <Header toggleShowMenu={this.toggleShowMenu} />
                         <GraphContent />
                    </Col>
                    <Col xs={6} sm={3} className="sidebar-offcanvas" role="navigation" id="sidebar">
                        <SideMenu />
                    </Col>
                </Row>
            </Grid>
        );
    }
});

var OffCanvasMenu = React.createClass({
    propTypes : {
        toggleShowMenu: React.PropTypes.func.isRequired
    },
    render : function() {
        return (
            <span className="pull-right visible-xs">
                <Button bsSize="large" onClick={this.props.toggleShowMenu}>
                    <span className="glyphicon glyphicon-menu-hamburger"></span>
                </Button>
            </span>
        );
    }
});

var Header = React.createClass({
    propTypes : {
        toggleShowMenu: React.PropTypes.func.isRequired
    },
    render : function() {
        return (
            <div>
                <h1>iris dataset <OffCanvasMenu toggleShowMenu={this.props.toggleShowMenu} /></h1>
                <GraphMenu />
            </div>
        );
    }
});

var SideMenu = React.createClass({
    render : function() {
        return (
            <div>
                <Row className="side-box">
                    <SideHeader />
                </Row>

                <Row className="side-box side-content">
                    <SearchInput />

                    <SearchResult />

                    <SelectResult />

                    <StaticalResult />
                </Row>
            </div>
        );
    }
});

var SideHeader = React.createClass({
    render : function() {
        return (
            <ButtonToolbar className="h1 pull-right">
                <Button bsSize="small"><span className="glyphicon glyphicon-question-sign"></span> HELP</Button>
                <InformationButton />
            </ButtonToolbar>
        );
    }
});

var InformationButton = React.createClass({
    getInitialState() {
        return { showModal: false };
    },
    close() {
        this.setState({ showModal: false });
    },
    open() {
        this.setState({ showModal: true });
    },
    render : function() {
        return (
            <Button bsSize="small" onClick={this.open}><span className="glyphicon glyphicon-info-sign"></span> INFORMATION

            <Modal show={this.state.showModal} onHide={this.close}>
                <Modal.Header closeButton>
                    <Modal.Title>INFORMATION</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p class="h3">Copyright &copy; 2016 ksgwr (MIT LICENSE)</p>

                    <p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>
                    <p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
                    <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.close}>Close</Button>
                </Modal.Footer>
            </Modal>
            </Button>
        );
    }
});

var SearchTooltip = (
    <Tooltip>Input 'Field:Value'. Default field is LabelName.</Tooltip>
);

var SearchInput = React.createClass({
    render : function() {
        return (
            <div className="search-wrap">
                <form id="search-form" className="form-inline">
                    <div className="input-group">
                        <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={SearchTooltip}>
                            <input type="text" className="form-control search-form" placeholder="Search..."
                                                       data-toggle="tooltip" data-placement="bottom"/>
                        </OverlayTrigger>
                        <span className="input-group-btn">
                        <Button type="submit" className="btn btn-primary search-btn" data-target="#search-form" name="q"><span className="glyphicon glyphicon-search" /></Button>
                        </span></div>
                </form>
            </div>
        );
    }
});

var SearchResult = React.createClass({
    render : function() {
        return (
            <div>
                <p className="pull-left label label-primary">Search Results...</p>
                <div className="well"><br />
                    <p>None</p>
                </div>
            </div>
        );
    }
});

var SelectResult = React.createClass({
    render : function() {
        return (
            <div>
                <p className="pull-left label label-default">Selecting...</p>
                <div className="well"><br />
                    <div id="selectTarget"></div>
                    <p>None</p>
                </div>
            </div>
        );
    }
});

var StaticalPanelHeader = (
    <span><span className="glyphicon glyphicon-stats" /> Statical Selecting Nodes</span>
);

var StaticalResult = React.createClass({
    render : function() {
        return (
            <Accordion>
                <Panel eventKey="1" header={StaticalPanelHeader}>
                    Not calculated
                </Panel>
            </Accordion>

        );
    }
});

var GraphMenu = React.createClass({
    componentDidMount: GraphContentLoads,
    render : function() {
        return (
            <ButtonGroup className="pull-right" role="group" aria-label="Graph Menu">
                <Button aria-label="Zoom-in"><span className="glyphicon glyphicon-zoom-in"></span></Button>
                <Button aria-label="Zoom-out"><span className="glyphicon glyphicon-zoom-out"></span></Button>
                <Button aria-label="Move"><span className="glyphicon glyphicon-move"></span></Button>
                <Button aria-label="FullScreen"><span className="glyphicon glyphicon-fullscreen"></span></Button>
                <Button aria-label="SavePNG"><span className="glyphicon glyphicon-save"></span></Button>
                <Button aria-label="Brush"><span className="glyphicon glyphicon-stop"></span></Button>
            </ButtonGroup>
        );
    }
});

var GraphContent = React.createClass({
    render : function() {
        return (
            <div id="main"></div>
        );
    }

});

React.render(
    <Container />,
    document.getElementById('reactContent')
);