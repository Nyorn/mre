<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $message = trim($_POST["message"]);
    $key = trim($_POST["key"]); // Получаем key

    // Проверяем данные...
    if (empty($name) OR empty($message) OR !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        // Здесь обработка ошибки, если данные некорректны
        http_response_code(400);
        echo "Пожалуйста, заполните форму и повторите попытку.";
        exit;
    }

    // Здесь ваш email для получения сообщений
    $recipient = "your_email@example.com";

    // Тема письма
    $subject = "Новое сообщение от $name";

    // Содержимое письма
    $email_content = "Имя: $name\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Сообщение:\n$message\n\n";
    $email_content .= "Key: $key\n"; // Добавляем key в сообщение

    // Заголовки письма
    $email_headers = "From: $name <$email>";

    // Отправка письма
    if (mail($recipient, $subject, $email_content, $email_headers)) {
        // Успешная отправка
        http_response_code(200);
        echo "Спасибо! Ваше сообщение было отправлено.";
    } else {
        // Ошибка при отправке
        http_response_code(500);
        echo "Ой! Что-то пошло не так, и мы не смогли отправить ваше сообщение.";
    }

} else {
    // Не POST запрос, выводим ошибку 403
    http_response_code(403);
    echo "Произошла ошибка при отправке, пожалуйста, попробуйте еще раз.";
}
?>
