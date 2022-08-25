import React from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  Nav,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavLink,
} from 'reactstrap';
import '../../assets/css/black-dashboard-react.css';
import githubIcon from '../../assets/img/Github-Mark-Light-64px.png';

class Navigator extends React.Component{
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.dropdownToggle = this.dropdownToggle.bind(this);
        this.state = {
            isOpen: false,
            dropdownOpen: new Array(this.props.routes.length).fill(false)
        };
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }
    dropdownToggle(e, idx){
        const { dropdownOpen } = this.state;
        for (let i = 0; i< dropdownOpen.length ; i++)
        {
            if(i == idx){
                dropdownOpen[i] = !dropdownOpen[i]
            }
            else{
                dropdownOpen[i] = false;
            }
        }

        this.setState({
            dropdownOpen
        });
    }

    render(){
        const {routes} = this.props;
        return(
            <Navbar expand="lg" color="dark">
                <NavbarToggler onClick={this.toggle}>
                    <span className="navbar-toggler-bar navbar-kebab"></span>
                    <span className="navbar-toggler-bar navbar-kebab"></span>
                    <span className="navbar-toggler-bar navbar-kebab"></span>
                </NavbarToggler>
                <Collapse isOpen={this.state.isOpen} navbar>
                    <Nav navbar>
                        <NavLink href="/klaytn-online-toolkit"> Home </NavLink>
                        <NavLink href="/klaytn-online-toolkit/web3modal"> Web3Modal </NavLink>
                        {routes.map((prop, key) => {
                            return (
                                <Dropdown tag="nav" isOpen={this.state.dropdownOpen[key]} toggle={(e) => this.dropdownToggle(e, key)}>
                                    <DropdownToggle caret nav>
                                        {prop.name}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                    {prop.items.map((item, _) => {
                                        return (
                                            <DropdownItem disabled={item.component===null} href = {"/klaytn-online-toolkit" + prop.path + item.path}>
                                                {item.name}
                                            </DropdownItem>
                                        )
                                    })}
                                    </DropdownMenu>
                                </Dropdown>
                            )
                        })}
                        <NavLink href="https://github.com/klaytn/klaytn-online-toolkit">
                            <img src={githubIcon} style={{height: "25px", width: "25px"}} />
                        </NavLink>
                    </Nav>
                </Collapse>
            </Navbar>
        );
    }
}

export default Navigator