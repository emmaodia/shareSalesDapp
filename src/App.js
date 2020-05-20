import 'regenerator-runtime/runtime'
import React, { useCallback, useEffect, useState } from 'react'
import { Navbar, Nav, NavDropdown, Form, FormControl, Button, Jumbotron, Container, Row, Col, CardDeck, Card} from 'react-bootstrap';
import image from './crowdfunf.jpg';
import PropTypes from 'prop-types'
import Big from 'big.js'

const SUGGESTED_DONATION = '1'
const BOATLOAD_OF_GAS = Big(1).times(10 ** 16).toFixed()

const App = ({ contract, currentUser, nearConfig, wallet }) => {
  const [messages, setMessages] = useState([])
  
  useEffect(() => {
    // TODO: don't just fetch once; subscribe!
    contract.getMessages().then(setMessages)
  }, [])

  const onSubmit = useCallback(e => {
    e.preventDefault()

    const { fieldset, message, donation } = e.target.elements

    fieldset.disabled = true

    // TODO: optimistically update page with new message,
    // update blockchain data in background
    // add uuid to each message, so we know which one is already known
    contract.addMessage(
      { text: message.value },
      BOATLOAD_OF_GAS,
      Big(donation.value || '0').times(10 ** 24).toFixed()
    ).then(() => {
      contract.getMessages().then(messages => {
        setMessages(messages)

        message.value = ''
        donation.value = SUGGESTED_DONATION
        fieldset.disabled = false
        message.focus()
      })
    })
  }, [contract])

  const signIn = useCallback(() => {
    wallet.requestSignIn(
      nearConfig.contractName,
      'NEAR CrowdFund dApp'
    )
  }, [])

   const Donate = useCallback(() => {
    wallet.requestSignIn(
      nearConfig.contractName,
      'NEAR CrowdFund dApp'
    )
  }, [])

  const signOut = useCallback(() => {
    wallet.signOut()
    window.location = '/'
  }, [])
  
  return (
    <>
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="#home">NEAR Crowdfund dApp</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse className="justify-content-end">
        <Nav>
          <Nav.Link>
            <Form inline>
              <FormControl type="text" placeholder="Search" className="mr-sm-2" />
              <Button variant="outline-success">Search</Button>
            </Form>
          </Nav.Link>
          <Nav.Link>
            {currentUser
              ? <Button variant="outline-primary" onClick={signOut}>Log out</Button>
              : <Button variant="outline-success" onClick={signIn}>Log in</Button>
            }
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
            
    <Jumbotron fluid>
      <Container>
        <h1>NEAR Crowdfund dApp</h1>
        <p>
          This dApp was built beginning with the Guest Book and Wallet Templates of the NEAR examples.
          Users can create a Campaign. Donors can Donate to a Campaign. Create a Campaign or Donate to one now!
        </p>
        {currentUser && (
          <Form onSubmit={onSubmit}>
           <fieldset id="fieldset">
            <h2>Create a campaign, { currentUser.accountId }!</h2>
              <Form.Row>
                <Form.Group as={Col}>
                  <Form.Control type="text" id="message" placeholder="Enter Campaign Title" required/>
                </Form.Group>

                <Form.Group as={Col}>
                  <Form.Control type="number"  
                  id="donation" 
                  placeholder="Amount" 
                  defaultValue={SUGGESTED_DONATION}
                  max={Big(currentUser.balance).div(10 ** 24)}
                  min="0"
                  step="0.01" 
                  required/>
                </Form.Group>
              </Form.Row>
              
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </fieldset>
          </Form>
        )}
      </Container>
    </Jumbotron>
    <Container>
      <CardDeck>
        {!!messages.length && (
          <>
            {messages.map((message, i) =>
            
              <Card>
                <p key={i} className={message.premium ? 'is-premium' : ''}></p>
                <Card.Img variant="top" src={image}/>
                <Card.Body>
                  <Card.Title>Goal: {Math.round(message.premium)}</Card.Title>
                  <Card.Text>
                    Description: {message.text}
                  </Card.Text>
                </Card.Body>
                <Card.Body>
                   <Button variant="success" type="submit" className="justify-content-end" onClick={Donate}>
                    Donate
                  </Button>
                </Card.Body>
                <Card.Footer>
                  <small className="text-muted">Owner: {message.sender}</small>
                </Card.Footer>
              </Card>
            )}
          </>
        )}
      </CardDeck>
    </Container>
    </>
  )
}

App.propTypes = {
  contract: PropTypes.shape({
    addMessage: PropTypes.func.isRequired,
    getMessages: PropTypes.func.isRequired
  }).isRequired,
  currentUser: PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired
  }),
  nearConfig: PropTypes.shape({
    contractName: PropTypes.string.isRequired
  }).isRequired,
  wallet: PropTypes.shape({
    requestSignIn: PropTypes.func.isRequired,
    signOut: PropTypes.func.isRequired
  }).isRequired
}

export default App
