// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

using Microsoft.AspNetCore.Mvc;
using WebApi.Messaging;

namespace WebApi.Controllers;

/// <summary>
///     Controller for sending messages. It uses the MessageSender service to send messages.
/// </summary>
/// <remarks>
///     Initializes a new instance of the <see cref="SendMessageController" /> class.
/// </remarks>
/// <param name="messageSender">The service used for sending messages.</param>
[ApiController]
[Route("[controller]")]
public class SendMessageController(MessageSender messageSender) : ControllerBase
{
    /// <summary>
    ///     Sends a message using the MessageSender service.
    /// </summary>
    /// <returns>A string indicating the result of the message sending operation.</returns>
    [HttpGet]
    public string Get() => messageSender.SendMessage();
}