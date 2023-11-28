const moment = require("moment");

exports.getInvoiceTemplate = async (data) => {
  return `
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
			<title>Invoice</title>
		</head>
		<body style="margin:0; font-size: 18px;line-height: 18px; background:#f1f1f1;font-family: 'Segoe UI', 'sans-serif';">
			<div style="width: 1000px; margin:0 auto; background:#fff; color:#000;font-family: 'Segoe UI', 'sans-serif';">
				<table cellpadding="0" cellspacing="0" style="width:1000px;margin: 0px 0 50px;font-family: 'Segoe UI', 'sans-serif';padding-top:15px;">
					<tbody>
						<tr>
							<td style="width:30px;">&nbsp;</td>
							<td>
								<table cellpadding="0" cellspacing="0" style="width: 940px;margin: 0 0 35px;font-family: 'Segoe UI', 'sans-serif';">
									<tr style="vertical-align:top; font-family: 'Segoe UI', 'sans-serif';">
										<td style="width: 500px; text-align: left;vertical-align:middle; font-family: 'Segoe UI', 'sans-serif';background:#151721;padding:20px 15px;">
											<!-- <img src="public_path('images/transferimmunity-ho.png') " alt="" width="300px"> -->
											<img src="https://res.cloudinary.com/arhamsoft-ltd/image/upload/v1675774221/biiview/logo_gfmtkp.png" alt="" width="100px" >
										</td>
									</tr>
									<tr style="vertical-align:top; font-family: 'Segoe UI', 'sans-serif'; ">
										<td colspan="2" style="vertical-align:top;height: 945px;font-family: 'Segoe UI', 'sans-serif';">
											<table cellpadding="0" cellspacing="0" style="width: 940px;background-color:#ffffff;">
												<tr style="vertical-align: middle; font-family: 'Segoe UI', 'sans-serif';">
													<td style="width:470px;padding-top:20px; font-family: 'Segoe UI', 'sans-serif';">
														<table cellpadding="0" cellspacing="0" style="width:470px;border-collapse: collapse;font-size: 18px;line-height: 18px;">
															<tr>
																<td>
																	<span style="color: #000; font-size: 14px; padding-bottom: 10px; font-family: 'Segoe UI', 'sans-serif';">
																	${data.site.name}
																		<span style="font-family: Segoe, 'Segoe UI', 'sans-serif';">•</span>
																		${data.site.address}
																	</span>
																	<p style="color: #000; font-size: 14px; margin:0;padding-top: 25px;font-family: 'Segoe UI', 'sans-serif';">
																		<span style="display:block;">${
                                      data.user && data.user.fullName
                                        ? data.user.fullName
                                        : ""
                                    } </span>
																		<span style="display:block;">${
                                      data.user && data.user.address
                                        ? data.user.address
                                        : ""
                                    } </span>
																	</p>
																</td>
															</tr>
														</table>
													</td>
													<td style="width: 470px;padding-top:20px;text-align: right;font-family: 'Segoe UI', 'sans-serif';">
														<table cellpadding="0" cellspacing="0" style="width: 470px;border-collapse: collapse;border: 1px solid #9f9f9f;font-size: 14px;line-height: 18px; padding: 4px 8px; font-family: 'Segoe UI', 'sans-serif';">
															<thead>
																<tr>
																	<th style="text-align: left;font-weight: 700; padding-bottom: 5px;font-size: 16px;padding: 8px 0px 0px 10px;font-family: 'Segoe UI', 'sans-serif';">Invoice</th>
																	<th></th>
																</tr>
															</thead>
															<tbody>
																<tr>
																	<td style="padding: 8px 0 0px 10px;text-align: left;font-family: 'Segoe UI', 'sans-serif';">
																	${
                                    data.site.name +
                                    "/" +
                                    moment(data.createdAt).format("YYYY") +
                                    "/" +
                                    data.invoiceId
                                  }
	
																	<td style="color: #000;text-align: right;padding: 8px 10px 0px 0px; font-family: 'Segoe UI', 'sans-serif';">
																		Date</td>
																</tr>
																<tr>
																	<td style="border-bottom: 1px solid #9f9f9f;padding: 0px 0 8px 10px;text-align: left;font-family: 'Segoe UI', 'sans-serif';">
																		&nbsp;</td>
																	<td style="text-align: right;border-bottom: 1px solid #9f9f9f;padding: 0px 10px 8px 0px;font-family: 'Segoe UI', 'sans-serif';">
																	${moment(new Date()).format("DD/MM/YYYY")}</td>
																</tr>
																<tr>
																	<td style="border-bottom: 1px solid #9f9f9f;padding: 0px 0 8px 10px;text-align: left;font-family: 'Segoe UI', 'sans-serif';">
																	${
                                    data.site.name +
                                    "/" +
                                    moment(data.createdAt).format("YYYY") +
                                    "/" +
                                    data.invoiceId
                                  } </td>
																	<td style="text-align: right;border-bottom: 1px solid #9f9f9f;padding: 0px 10px 8px 0px;font-family: 'Segoe UI', 'sans-serif';">
																	${data.site.name}</td>
																</tr>
																<tr>
																	<td style="color: #000;border-bottom: 1px solid #9f9f9f;padding: 8px 0 8px 10px;text-align: left;font-family: 'Segoe UI', 'sans-serif';">
																	${data.user && data.user.fullName ? data.user.fullName : ""} </td>
																	<td style="color: #000;border-bottom: 1px solid #9f9f9f;font-family: 'Segoe UI', 'sans-serif';"></td>
																</tr>
																<tr>
																	<td style="color: #000;padding: 8px 0 0px 10px;text-align: left;font-family: 'Segoe UI', 'sans-serif';">
																	${data.site.name}</td>
																	<td></td>
																</tr>
															</tbody>
														</table>
													</td>
												</tr>
												<tr>
													<td colspan="2" style="padding-top:50px;font-family: 'Segoe UI', 'sans-serif';">
														<table cellpadding="0" cellspacing="0" style="width: 940px;border-collapse: collapse;font-size: 13px;line-height: 18px;margin-bottom: 50px;font-family: 'Segoe UI', 'sans-serif';">
															<thead>
																<tr style="border-bottom: 1px solid #9f9f9f; border-top: 1px solid #9f9f9f; padding: 12px 0;font-family: 'Segoe UI', 'sans-serif';">
																	<th style="font-weight: 700;text-align: left;padding: 4px 0;font-family: 'Segoe UI', 'sans-serif';">Pos</th>
																	<th style="font-weight: 700;text-align: left;padding: 4px 0;font-family: 'Segoe UI', 'sans-serif';">Plan</th>
																	<th style="width:250px;font-weight: 700;text-align: left;padding: 4px 0;font-family: 'Segoe UI', 'sans-serif';">Description</th>
																	<th style="font-weight: 700;text-align: right;padding: 4px 0;font-family: 'Segoe UI', 'sans-serif';">Type</th>
																	<th style="font-weight: 700;text-align: right;padding: 4px 0;font-family: 'Segoe UI', 'sans-serif';">Price (USD)</th>
																	<th style="font-weight: 700;text-align: right;padding: 4px 0;font-family: 'Segoe UI', 'sans-serif';">Payment Status</th>
																</tr>
															</thead>
															
															<tbody>
																<tr>
																	<td style="padding-top:15px; text-align: left;width: 50px;  vertical-align: top;font-family: 'Segoe UI', 'sans-serif';">1</td>
																	<td style="padding-top:15px; text-align: left;width: 100px;vertical-align: top;;font-family:'Segoe UI', 'sans-serif';">${
                                    data.plan.name
                                  }</td>
																	<td style="padding-top:15px; text-align: left;width: 280px;vertical-align: top;font-family:'Segoe UI', 'sans-serif';">${
                                    data.plan.description
                                      ? data.plan.description
                                      : ""
                                  }</td>
																	<td style="padding-top:15px; text-align: right;width: 110px;vertical-align: top;font-family:'Segoe UI', 'sans-serif';">${
                                    data.planDuration
                                  }</td>
																	<td style="padding-top:15px; text-align: right;width: 150px;vertical-align: top;font-family: 'Segoe UI', 'sans-serif';">${
                                    data.price
                                  }</td>
																	<td style="padding-top:15px; text-align: right;width: 150px;vertical-align: top;font-family: 'Segoe UI', 'sans-serif';"> ${
                                    data.paymentStatus
                                  }</td>
																</tr>
															</tbody>
														</table>
													</td>
												</tr>
												<tr>
													<td style="width:470px; text-align: left;vertical-align:middle;font-family: 'Segoe UI', 'sans-serif';"></td>
													<td style="width:470px; text-align: right;vertical-align:middle;padding-top:40px;font-family: 'Segoe UI', 'sans-serif';">
														<table cellpadding="0" cellspacing="0" style="border-collapse: collapse;width:470px;float: right;font-size: 14px;line-height: 18px; padding: 4px 8px;font-family: 'Segoe UI', 'sans-serif';">
															<tbody>
																<tr>
																	<td style="padding: 10px 0 10px 0px;border-bottom: 1px solid #9f9f9f;border-top: 1px solid #9f9f9f;text-align: left;font-family: 'Segoe UI', 'sans-serif';">Net</td>
																	<td style="color: #000;text-align: right;	padding: 10px 0px 10px 0px;border-top: 1px solid #9f9f9f;border-bottom: 1px solid #9f9f9f;font-family: 'Segoe UI', 'sans-serif';">${
                                    data.price
                                  } $</td>
																</tr>
																<tr>
																	<td style="padding: 10px 0 0px 0px;font-weight: 700;text-align: left; font-family: 'Segoe UI', 'sans-serif';">Total</td>
																	<td style="text-align: right;padding: 4px 0px 0px 0px;font-weight: 700;font-family: 'Segoe UI', 'sans-serif';">${
                                    data.price
                                  } $</td>
																</tr>
															</tbody>
														</table>
													</td>
												</tr>
												<tr>
													<td colspan="2" style="width:470px;padding-top: 40px;font-family: 'Segoe UI', 'sans-serif';">
														<table cellpadding="0" cellspacing="0" style="width:470px;margin-bottom:20px;font-family: 'Segoe UI', 'sans-serif';">
															<tbody>
																<tr>
																	<td colspan="2" style="height:15px;"></td>
																</tr>
			
															</tbody>
														</table>
													</td>
												</tr>
											</table>
										</td>
									</tr>
									<tr>
										<td colspan="2">
											<table cellpadding="0" cellspacing="0" style="width: 940px;border-collapse: collapse;font-size: 14px;line-height: 18px;font-family: 'Segoe UI', 'sans-serif';">
												<tr>
													<td width="420px" style="border-bottom: 1px solid #9f9f9f; padding-bottom:5px;font-family: 'Segoe UI', 'sans-serif';">
														<p style="margin: 0; padding-bottom: 8px;color: #000;font-family: 'Segoe UI', 'sans-serif';">Invoice ${
                              data.site.name +
                              "/" +
                              moment(data.createdAt).format("YYYY") +
                              "/" +
                              data.invoiceId
                            } </p>
													</td>
													<td width="280px" style="border-bottom: 1px solid #9f9f9f;font-family: 'Segoe UI', 'sans-serif';"></td>
													<td width="240px" style="border-bottom: 1px solid #9f9f9f;text-align:right;padding-bottom:5px;font-family: 'Segoe UI', 'sans-serif';">
														<p style="margin: 0; padding-bottom: 8px;color: #000;font-family: 'Segoe UI', 'sans-serif';">Page 1 / 1</p>
													</td>
												</tr>
												<tr>
													<td style="padding-top:10px;vertical-align:top;font-family: 'Segoe UI', 'sans-serif';">
														<p style="color: #000;font-family: 'Segoe UI', 'sans-serif';">
															${data.site.name}<br>
															${data.site.address}<br>
															Email:
															<span style="color:#FC491E; font-family: 'Segoe UI', 'sans-serif';">${
                                data.site.email
                              }</span><br>
															Website:
															<span style="font-size: 13"> <a  style="color:#FC491E; text-decoration: none;" href=${
                                data.site.url
                              } target="_blank">${
                                data.site.name
                              }</a> </span><br>
															Company Website:
															<span style="font-size: 13"> <a  style="color:#FC491E; text-decoration: none;" href=${
                                data.company.url
                              } target="_blank"> ${data.company.name}</a></span>
														</p>
													</td>
												</tr>
											</table>
										</td>
									</tr>
								</table>
							</td>
							<td style="width:30px;">&nbsp;</td>
						</tr>
					</tbody>
				</table>
			</div>
		</body>
	</html>
`;
};
