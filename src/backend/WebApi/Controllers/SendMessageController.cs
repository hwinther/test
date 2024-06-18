// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

using Microsoft.AspNetCore.Mvc;
using Utils.Messaging;

namespace WebApi.Controllers;

/// <summary>
///     TODO
/// </summary>
[ApiController]
[Route("[controller]")]
public class SendMessageController : ControllerBase
{
    private readonly ILogger<SendMessageController> logger;
    private readonly MessageSender messageSender;

    /// <summary>
    ///     TODO
    /// </summary>
    /// <param name="logger"></param>
    /// <param name="messageSender"></param>
    public SendMessageController(ILogger<SendMessageController> logger, MessageSender messageSender)
    {
        this.logger = logger;
        this.messageSender = messageSender;
    }

    /// <summary>
    ///     TODO
    /// </summary>
    /// <returns></returns>
    [HttpGet]
    public string Get() => messageSender.SendMessage();
}