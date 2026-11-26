package com.example.demo.controller;

import org.springframework.web.bind.annotation.PatchMapping;
import com.example.demo.dto.MemberUpdateRequest;
import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.EmailCheckResponse;
import com.example.demo.dto.MemberResponse;
import com.example.demo.dto.NicknameCheckResponse;
import com.example.demo.dto.SignUpRequest;
import com.example.demo.service.MemberService;
import com.example.demo.config.SwaggerConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.dto.MemberInfoResponse;
import com.example.demo.interceptor.AuthInterceptor;
import org.springframework.web.bind.annotation.RequestAttribute;


@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
@Tag(name = "회원", description = "회원가입과 내 정보 API")
public class MemberController {
    private final MemberService memberService;

    @GetMapping("/nickname/{nickname}")
    public NicknameCheckResponse checkNickname(@PathVariable String nickname) {
        return memberService.checkNickname(nickname);
    }

    @GetMapping("/email/{email}")
    public EmailCheckResponse checkEmail(@PathVariable String email) {
        return memberService.checkEmail(email);
    }

    @Operation(
            summary = "회원가입",
            description = "이메일, 비밀번호, 닉네임으로 회원을 등록합니다. 토큰이 없어도 호출할 수 있는 공개 API입니다."
    )
    @PostMapping
    public ResponseEntity<ApiResponse<MemberResponse>> signUp(
            @Valid @RequestBody SignUpRequest request
    ) {
        MemberResponse response = memberService.signUp(request);
        return ResponseEntity.status(201)
                .body(ApiResponse.created("회원가입에 성공했습니다.", response));
    }

    // src/main/java/com/umc/movie/controller/MemberController.java 에 아래 메서드를 추가합니다
    @Operation(summary = "로그인한 회원의 내 정보 조회")
    @SecurityRequirement(name = SwaggerConfig.BEARER_AUTH)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "AUTH401_2: 토큰 없음 / AUTH401_3: 유효하지 않은 토큰 / AUTH401_4: 만료된 토큰")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "MEMBER404_1: 회원을 찾을 수 없습니다.")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MemberInfoResponse>> getMyInfo(
            // 인터셉터가 request.setAttribute("memberId", ...)로 담아둔 값을 꺼냅니다
            @RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId
    ) {
        MemberInfoResponse response = memberService.getMyInfo(memberId);
        return ResponseEntity.ok(ApiResponse.ok("회원 정보를 조회했습니다.", response));
    }

    // src/main/java/com/umc/movie/controller/MemberController.java 에 아래 메서드를 추가합니다
    @Operation(summary = "로그인한 회원의 닉네임 수정")
    @SecurityRequirement(name = SwaggerConfig.BEARER_AUTH)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "COMMON4001: 닉네임이 올바르지 않습니다.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "AUTH401_2: 토큰 없음 / AUTH401_3: 유효하지 않은 토큰 / AUTH401_4: 만료된 토큰")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "MEMBER404_1: 회원을 찾을 수 없습니다.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "MEMBER409_1: 이미 사용 중인 닉네임입니다.")
    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<MemberInfoResponse>> updateMyInfo(
            @RequestAttribute(AuthInterceptor.MEMBER_ID) Long memberId,
            @RequestBody @Valid MemberUpdateRequest request
    ) {
        MemberInfoResponse response = memberService.updateMyInfo(memberId, request);
        return ResponseEntity.ok(ApiResponse.ok("회원 정보를 수정했습니다.", response));
    }
}
