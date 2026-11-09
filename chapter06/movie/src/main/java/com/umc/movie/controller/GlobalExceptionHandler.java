package com.umc.movie.controller;
import org.springframework.web.server.ResponseStatusException;
import com.umc.movie.dto.ApiResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // DTO 입력값 검증 실패 → 400
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(
            MethodArgumentNotValidException exception) {

        String message = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getDefaultMessage())
                .findFirst()
                .orElse("입력값을 확인해주세요.");

        return ResponseEntity.badRequest()
                .body(ApiResponse.failure("COMMON400", message));
    }

    // 현재 Service에서 발생시키는 중복 오류 → 409
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleConflict(
            IllegalArgumentException exception) {

        return ResponseEntity.status(409)
                .body(ApiResponse.failure(
                        "COMMON409",
                        exception.getMessage()
                ));
    }

    // DB 제약 조건 위반 → 409
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(
            DataIntegrityViolationException exception) {

        return ResponseEntity.status(409)
                .body(ApiResponse.failure(
                        "COMMON409",
                        "데이터 제약 조건을 위반했습니다. 중복 여부와 참조 데이터를 확인해주세요."
                ));
    }
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Void>> handleResponseStatus(
            ResponseStatusException exception) {

        int status = exception.getStatusCode().value();

        String message = exception.getReason() != null
                ? exception.getReason()
                : "요청을 처리할 수 없습니다.";

        return ResponseEntity.status(exception.getStatusCode())
                .body(ApiResponse.failure(
                        "COMMON" + status,
                        message
                ));
    }
}