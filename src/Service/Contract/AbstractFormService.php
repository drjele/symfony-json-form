<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Service\Contract;

use Drjele\Symfony\JsonForm\Contract\DtoInterface;
use Drjele\Symfony\JsonForm\Exception\Exception;
use Drjele\Symfony\JsonForm\Form\Action;
use Drjele\Symfony\JsonForm\Form\Form;
use ReflectionClass;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\Serializer\SerializerInterface;

abstract class AbstractFormService
{
    private SerializerInterface $serializer;

    abstract protected function getDtoClass(): string;

    abstract protected function getMethod(): string;

    abstract protected function getAction(DtoInterface $dto): Action;

    abstract protected function build(Form $form, DtoInterface $dto): void;

    final public function setSerializer(SerializerInterface $serializer): self
    {
        $this->serializer = $serializer;

        return $this;
    }

    final public function render(DtoInterface $dto = null): array
    {
        if (null === $dto) {
            $dtoClass = $this->getDtoClass();
            /** @var DtoInterface $dto */
            $dto = new $dtoClass();
        }

        $formName = $this->getName();

        if (\get_class($dto) !== $this->getDtoClass()) {
            throw new Exception(\sprintf('invalid dto class for form `%s`', $formName));
        }

        $action = $this->getAction($dto);

        $form = new Form($formName, $this->getMethod(), $action);

        $this->build($form, $dto);

        $data = $this->serializer->normalize($dto);

        return $form->render($data);
    }

    final public function handleRequest(
        Request $request,
        DtoInterface $dto = null,
        bool $sanitizeData = true
    ): DtoInterface {
        [$data, $context] = $this->getDataAndContext($request);

        if (true === $sanitizeData) {
            $data = $this->sanitizeData($data);
        }

        if (null !== $dto) {
            $context[AbstractNormalizer::OBJECT_TO_POPULATE] = $dto;
        }

        return $this->serializer->denormalize($data, $this->getDtoClass(), null, $context);
    }

    protected function getDataAndContext(Request $request): array
    {
        $context = [];

        switch ($this->getMethod()) {
            case Request::METHOD_GET:
                $data = $request->query->all();
                $context[AbstractObjectNormalizer::DISABLE_TYPE_ENFORCEMENT] = true;
                break;
            case Request::METHOD_POST:
            case Request::METHOD_PUT:
            case Request::METHOD_PATCH:
                /** @todo handle based on request type */
                $requestContent = $request->getContent();
                if (false === empty($requestContent)) {
                    $data = (new JsonEncoder())->decode($requestContent, JsonEncoder::FORMAT);
                } else {
                    $data = $request->request->all();
                    $context[AbstractObjectNormalizer::DISABLE_TYPE_ENFORCEMENT] = true;
                }
                break;
            default:
                throw new Exception(
                    \sprintf('can not handle `%s` request method', $request->getMethod())
                );
        }

        return [$data[$this->getName()] ?? [], $context];
    }

    protected function getName(): string
    {
        $className = \lcfirst((new ReflectionClass(static::class))->getShortName());

        $position = \strrpos($className, 'Service');

        return false === $position ? $className : \substr($className, 0, $position);
    }

    protected function sanitizeData(array $data): array
    {
        $sanitizedData = [];

        foreach ($data as $key => $value) {
            switch (true) {
                case \is_array($value):
                    $value = $this->sanitizeData($value);

                    if (true === empty($value)) {
                        continue 2;
                    }
                    break;
                case \is_string($value):
                    if ('' === $value) {
                        continue 2;
                    }
                    break;
            }

            $sanitizedData[$key] = $value;
        }

        return $sanitizedData;
    }
}
