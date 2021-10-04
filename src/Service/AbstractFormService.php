<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Service;

use Drjele\Symfony\JsonForm\Contract\DtoInterface;
use Drjele\Symfony\JsonForm\Exception\Exception;
use Drjele\Symfony\JsonForm\Form\Action;
use Drjele\Symfony\JsonForm\Form\Form;
use ReflectionClass;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\SerializerInterface;

abstract class AbstractFormService
{
    protected SerializerInterface $serializer;

    abstract protected function getDtoClass(): string;

    abstract protected function getAction(): Action;

    abstract protected function build(Form $form): void;

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

        $form = new Form($formName, $this->getAction());

        $this->build($form);

        $data = $this->serializer->normalize($dto);

        return $form->render($data);
    }

    final public function handle(Request $request): DtoInterface
    {
        $data = $this->getData($request);

        return $this->serializer->denormalize($data, $this->getDtoClass());
    }

    protected function getData(Request $request): array
    {
        $data = [];

        switch ($request->getMethod()) {
            case Request::METHOD_GET:
                $data = $request->query->all();
                break;
            case Request::METHOD_POST:
            case Request::METHOD_PUT:
            case Request::METHOD_PATCH:
                $content = $request->getContent();

                if ($content) {
                    (new JsonEncoder())->decode($content, JsonEncoder::FORMAT)[$this->getName()] ?? [];
                }
                break;
            default:
                throw new Exception('can not handle `%s` request method', $request->getMethod());
        }

        return $data;
    }

    protected function getName(): string
    {
        $className = \lcfirst((new ReflectionClass(static::class))->getShortName());

        $position = \strrpos($className, 'Service');

        return false === $position ? $className : \substr($className, 0, $position);
    }
}
